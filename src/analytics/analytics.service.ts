import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from './entities/analytics.entity';
import { SurveysService } from '../surveys/surveys.service';
import { QuestionsService } from '../questions/questions.service';
import { ResponsesService } from '../responses/responses.service';
import { QuestionType } from '../questions/types/enums/question-type.enum';
import { Response } from '../responses/entities/response.entity';
import { UserService } from '../user/user.service';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

// Définir l'interface en dehors de la classe
interface QuestionTrendData {
  questionText: string;
  count: number;
  byDate: Record<string, number>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private surveysService: SurveysService,
    private questionsService: QuestionsService,
    private responsesService: ResponsesService,
    private userService: UserService,
  ) {}

  async generateSurveyAnalytics(surveyId: string): Promise<Analytics> {
    const survey = await this.surveysService.findOne(surveyId);
    const questions = await this.questionsService.findBySurvey(surveyId);

    const questionStats = {};
    let totalResponses = 0;
    let completionRate = 0;
    let totalCompletionTime = 0;
    let responseCount = 0;
    const demographicData = {};

    // Création du répertoire pour les exports si non existant
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Obtenir toutes les réponses pour ce sondage
    const allResponses = [];
    for (const question of questions) {
      const responses = await this.responsesService.findByQuestion(question.id);
      allResponses.push(...responses);

      questionStats[question.id] = {
        questionText: question.text,
        questionType: question.type,
        responseCount: responses.length,
        responseData: this.analyzeResponses(responses, question.type),
      };

      // Utilisez la première question pour compter le nombre total de réponses
      if (question === questions[0]) {
        totalResponses = responses.length;
      }
    }

    // Calcul du taux d'achèvement
    if (questions.length > 1 && totalResponses > 0) {
      const lastQuestionResponses =
        questionStats[questions[questions.length - 1].id].responseCount;
      completionRate = (lastQuestionResponses / totalResponses) * 100;
    } else {
      completionRate = 100;
    }

    // Calcul du temps moyen de complétion
    const responseUsers = [
      ...new Set(
        allResponses.map((response) => response.user?.id).filter(Boolean),
      ),
    ];
    for (const userId of responseUsers) {
      const userResponses = allResponses.filter((r) => r.user?.id === userId);
      if (userResponses.length > 0) {
        const firstResponse = userResponses.reduce((earliest, current) =>
          earliest.createdAt < current.createdAt ? earliest : current,
        );
        const lastResponse = userResponses.reduce((latest, current) =>
          latest.createdAt > current.createdAt ? latest : current,
        );

        const completionTimeInMinutes =
          (lastResponse.createdAt.getTime() -
            firstResponse.createdAt.getTime()) /
          60000;

        if (completionTimeInMinutes > 0) {
          totalCompletionTime += completionTimeInMinutes;
          responseCount++;
        }
      }
    }

    const averageCompletionTime =
      responseCount > 0 ? totalCompletionTime / responseCount : 0;

    // Analyse démographique basée sur les utilisateurs ayant répondu
    await this.analyzeDemographics(responseUsers, demographicData);

    // Génération des exports
    const exportPaths = {
      csv: await this.exportToCsv(surveyId, questions, allResponses),
      excel: await this.exportToExcel(surveyId, questions, allResponses),
      pdf: await this.exportToPdf(surveyId, survey, questionStats),
    };

    let analytics = await this.analyticsRepository.findOne({
      where: { surveyId },
    });

    if (!analytics) {
      // Créer une nouvelle instance d'Analytics
      const newAnalytics = new Analytics();
      newAnalytics.surveyId = surveyId;
      newAnalytics.totalResponses = totalResponses;
      newAnalytics.completionRate = completionRate;
      newAnalytics.questionStats = questionStats;
      newAnalytics.demographicData = demographicData;
      newAnalytics.averageCompletionTime = averageCompletionTime;
      newAnalytics.exportPaths = exportPaths;

      return this.analyticsRepository.save(newAnalytics);
    } else {
      // Mettre à jour l'instance existante
      analytics.totalResponses = totalResponses;
      analytics.completionRate = completionRate;
      analytics.questionStats = questionStats;
      analytics.demographicData = demographicData;
      analytics.averageCompletionTime = averageCompletionTime;
      analytics.exportPaths = exportPaths;

      return this.analyticsRepository.save(analytics);
    }
  }

  private analyzeResponses(responses: Response[], questionType: QuestionType) {
    switch (questionType) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        const frequencyMap = {};
        const totalResponses = responses.length;

        for (const response of responses) {
          const answers = response.answer.split(',');
          for (const answer of answers) {
            frequencyMap[answer] = (frequencyMap[answer] || 0) + 1;
          }
        }

        // Ajout des pourcentages
        const resultWithPercentages = {};
        for (const [key, value] of Object.entries(frequencyMap)) {
          resultWithPercentages[key] = {
            count: value,
            percentage:
              totalResponses > 0
                ? ((value as number) * 100) / totalResponses
                : 0,
          };
        }

        return resultWithPercentages;

      case QuestionType.RATING:
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;
        const distribution = {};

        for (const response of responses) {
          const rating = parseInt(response.answer, 10);
          sum += rating;
          min = Math.min(min, rating);
          max = Math.max(max, rating);

          // Distribution des réponses
          distribution[rating] = (distribution[rating] || 0) + 1;
        }

        const average = responses.length > 0 ? sum / responses.length : 0;

        return {
          average,
          count: responses.length,
          min: min !== Infinity ? min : 0,
          max: max !== -Infinity ? max : 0,
          distribution,
        };

      case QuestionType.TEXT:
        // Pour les réponses textuelles, nous pouvons analyser la longueur moyenne et fournir des exemples
        let totalLength = 0;
        const examples = responses.slice(0, 5).map((r) => r.answer);

        for (const response of responses) {
          totalLength += response.answer.length;
        }

        const averageLength =
          responses.length > 0 ? totalLength / responses.length : 0;

        return { count: responses.length, averageLength, examples };

      case QuestionType.DATE:
        // Pour les dates, nous pouvons analyser la distribution par mois/année
        const dateDistribution = {};

        for (const response of responses) {
          try {
            const date = new Date(response.answer);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            dateDistribution[monthYear] =
              (dateDistribution[monthYear] || 0) + 1;
          } catch (error) {
            // Ignorer les dates invalides
          }
        }

        return { count: responses.length, dateDistribution };

      default:
        return { count: responses.length };
    }
  }

  private async analyzeDemographics(userIds: string[], demographicData) {
    // Cette fonction pourrait être étendue pour intégrer des données démographiques réelles
    // Pour l'instant, nous allons simplement compter les utilisateurs par rôle
    const roleDistribution = {};

    for (const userId of userIds) {
      try {
        const user = await this.userService.findOne(userId);
        roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
      } catch (error) {
        // Ignorer les utilisateurs non trouvés
      }
    }

    demographicData.roleDistribution = roleDistribution;
    demographicData.totalParticipants = userIds.length;

    return demographicData;
  }

  private async exportToCsv(
    surveyId: string,
    questions,
    responses,
  ): Promise<string> {
    const filename = `survey_${surveyId}_results.csv`;
    const filepath = path.join(process.cwd(), 'exports', filename);

    // Création de l'en-tête du CSV
    let csvContent =
      'ResponseID,QuestionID,QuestionText,Answer,UserID,Timestamp\n';

    // Ajout des données
    for (const response of responses) {
      const question = questions.find(
        (q) => q.id === response.question.id || q.id === response.question,
      );
      const questionText = question
        ? question.text.replace(/,/g, ' ')
        : 'Unknown';
      const answer = response.answer.replace(/,/g, ' ');
      const userId = response.user?.id || 'anonymous';
      const timestamp = response.createdAt.toISOString();

      csvContent += `${response.id},${response.question.id || response.question},${questionText},${answer},${userId},${timestamp}\n`;
    }

    fs.writeFileSync(filepath, csvContent);
    return filepath;
  }

  private async exportToExcel(
    surveyId: string,
    questions,
    responses,
  ): Promise<string> {
    const filename = `survey_${surveyId}_results.xlsx`;
    const filepath = path.join(process.cwd(), 'exports', filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Survey Results');

    // Définition des colonnes
    worksheet.columns = [
      { header: 'Response ID', key: 'responseId', width: 36 },
      { header: 'Question ID', key: 'questionId', width: 36 },
      { header: 'Question Text', key: 'questionText', width: 40 },
      { header: 'Answer', key: 'answer', width: 30 },
      { header: 'User ID', key: 'userId', width: 36 },
      { header: 'Timestamp', key: 'timestamp', width: 20 },
    ];

    // Ajout des données
    for (const response of responses) {
      const question = questions.find(
        (q) => q.id === response.question.id || q.id === response.question,
      );

      worksheet.addRow({
        responseId: response.id,
        questionId: response.question.id || response.question,
        questionText: question ? question.text : 'Unknown',
        answer: response.answer,
        userId: response.user?.id || 'anonymous',
        timestamp: response.createdAt.toISOString(),
      });
    }

    // Style des en-têtes
    worksheet.getRow(1).font = { bold: true };

    // Création d'un deuxième onglet avec des statistiques
    const statsSheet = workbook.addWorksheet('Summary Statistics');

    statsSheet.columns = [
      { header: 'Question', key: 'question', width: 40 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Responses', key: 'responses', width: 10 },
      { header: 'Summary', key: 'summary', width: 50 },
    ];

    statsSheet.getRow(1).font = { bold: true };

    // Regroupement des réponses par question
    const questionResponses = {};
    for (const response of responses) {
      const questionId = response.question.id || response.question;
      if (!questionResponses[questionId]) {
        questionResponses[questionId] = [];
      }
      questionResponses[questionId].push(response);
    }

    // Ajout des statistiques par question
    for (const question of questions) {
      const questionRes = questionResponses[question.id] || [];
      let summary = '';

      switch (question.type) {
        case QuestionType.SINGLE_CHOICE:
        case QuestionType.MULTIPLE_CHOICE:
          const counts = {};
          for (const response of questionRes) {
            const answers = response.answer.split(',');
            for (const answer of answers) {
              counts[answer] = (counts[answer] || 0) + 1;
            }
          }
          summary = Object.entries(counts)
            .map(
              ([option, count]) =>
                `${option}: ${count} (${Math.round(((count as number) * 100) / questionRes.length)}%)`,
            )
            .join(', ');
          break;

        case QuestionType.RATING:
          let sum = 0;
          for (const response of questionRes) {
            sum += parseInt(response.answer, 10);
          }
          const avg = questionRes.length > 0 ? sum / questionRes.length : 0;
          summary = `Average rating: ${avg.toFixed(2)}/5`;
          break;

        default:
          summary = `${questionRes.length} responses`;
      }

      statsSheet.addRow({
        question: question.text,
        type: question.type,
        responses: questionRes.length,
        summary,
      });
    }

    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  private async exportToPdf(
    surveyId: string,
    survey,
    questionStats: Record<string, any>,
  ): Promise<string> {
    const filename = `survey_${surveyId}_report.pdf`;
    const filepath = path.join(process.cwd(), 'exports', filename);

    // Création du document PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Ajout de l'en-tête avec les informations de l'enquête
    doc.fontSize(20).text("Rapport d'enquête", { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(survey.title, { align: 'center' });
    doc.moveDown();

    if (survey.description) {
      doc.fontSize(12).text(survey.description);
      doc.moveDown();
    }

    // Ajout des métadonnées du sondage
    doc
      .fontSize(12)
      .text(`Date de création: ${survey.createdAt.toLocaleDateString()}`);
    doc.text(`Statut: ${survey.status}`);
    doc.text(`Type: ${survey.type}`);
    if (survey.startDate) {
      doc.text(`Date de début: ${survey.startDate.toLocaleDateString()}`);
    }
    if (survey.endDate) {
      doc.text(`Date de fin: ${survey.endDate.toLocaleDateString()}`);
    }
    doc.moveDown();

    // Résumé global
    doc.fontSize(14).text('Résumé des réponses', { underline: true });
    doc.moveDown();

    // Utiliser un type explicite pour éviter l'erreur TS2339
    const firstQuestionStats = Object.values(questionStats)[0] as
      | { responseCount?: number }
      | undefined;
    doc
      .fontSize(12)
      .text(
        `Nombre total de réponses: ${firstQuestionStats?.responseCount || 0}`,
      );
    doc.text(`Taux d'achèvement: ${Math.round(survey.completionRate || 0)}%`);
    doc.moveDown(2);

    // Analyse par question
    doc.fontSize(14).text('Analyse par question', { underline: true });
    doc.moveDown();

    // Pour chaque question
    Object.entries(questionStats).forEach(([questionId, stats]) => {
      const questionData = stats as any;

      doc
        .fontSize(12)
        .text(`Question: ${questionData.questionText}`, { bold: true });
      doc.text(`Type: ${questionData.questionType}`);
      doc.text(`Nombre de réponses: ${questionData.responseCount}`);

      // Affichage spécifique selon le type de question
      if (
        questionData.questionType === QuestionType.SINGLE_CHOICE ||
        questionData.questionType === QuestionType.MULTIPLE_CHOICE
      ) {
        doc.moveDown();
        doc.text('Distribution des réponses:');

        Object.entries(questionData.responseData).forEach(([option, data]) => {
          const optionData = data as any;
          doc.text(
            `  - ${option}: ${optionData.count} (${Math.round(optionData.percentage)}%)`,
          );
        });
      } else if (questionData.questionType === QuestionType.RATING) {
        doc.moveDown();
        doc.text(
          `Note moyenne: ${questionData.responseData.average.toFixed(2)}`,
        );
        doc.text(`Note minimale: ${questionData.responseData.min}`);
        doc.text(`Note maximale: ${questionData.responseData.max}`);

        doc.moveDown();
        doc.text('Distribution des notes:');
        Object.entries(questionData.responseData.distribution).forEach(
          ([rating, count]) => {
            doc.text(`  - ${rating}: ${count} réponses`);
          },
        );
      } else if (
        questionData.questionType === QuestionType.TEXT &&
        questionData.responseData.examples &&
        questionData.responseData.examples.length > 0
      ) {
        doc.moveDown();
        doc.text(
          `Longueur moyenne des réponses: ${Math.round(questionData.responseData.averageLength)} caractères`,
        );

        doc.moveDown();
        doc.text('Exemples de réponses:');
        questionData.responseData.examples.forEach((example, index) => {
          doc.text(
            `  ${index + 1}. ${example.substring(0, 100)}${example.length > 100 ? '...' : ''}`,
          );
        });
      }

      doc.moveDown(2);
    });

    // Pied de page
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc
      .fontSize(10)
      .text(
        `Rapport généré le ${new Date().toLocaleString()} - Survey Management App`,
        0,
        doc.page.height - 50,
        { align: 'center' },
      );

    doc.page.margins.bottom = bottom;

    // Finalisation du document
    doc.end();

    // Attendre la fin de l'écriture du fichier
    return new Promise<string>((resolve, reject) => {
      stream.on('finish', () => resolve(filepath));
      stream.on('error', (error) => reject(error));
    });
  }

  async getSurveyAnalytics(surveyId: string): Promise<Analytics> {
    let analytics = await this.analyticsRepository.findOne({
      where: { surveyId },
    });

    if (!analytics) {
      analytics = await this.generateSurveyAnalytics(surveyId);
    }

    return analytics;
  }

  async getSurveyTrends(
    surveyId: string,
    period: 'day' | 'week' | 'month' = 'day',
  ): Promise<any> {
    const survey = await this.surveysService.findOne(surveyId);
    const questions = await this.questionsService.findBySurvey(surveyId);

    // Collecter toutes les réponses pour l'enquête
    const allResponses = [];
    for (const question of questions) {
      const responses = await this.responsesService.findByQuestion(question.id);
      allResponses.push(
        ...responses.map((response) => ({
          ...response,
          questionId: question.id,
          questionText: question.text,
        })),
      );
    }

    // Trier les réponses par date de création
    allResponses.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (allResponses.length === 0) {
      return { message: 'No responses available for trends analysis' };
    }

    // Calculer la date de début pour la période spécifiée
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        // Dernières 24 heures
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        // Dernière semaine
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Dernier mois
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Filtrer les réponses pour la période spécifiée
    const filteredResponses = allResponses.filter(
      (response) => response.createdAt >= startDate,
    );

    // Préparer les données pour l'analyse des tendances
    const trends = {
      period,
      totalResponses: filteredResponses.length,
      responsesByDate: {},
      responsesByQuestion: {},
      completionRateByDate: {},
    };

    // Formatage de la date selon la période
    const formatDate = (date: Date) => {
      switch (period) {
        case 'day':
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        case 'week':
        case 'month':
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    };

    // Initialisation des compteurs
    filteredResponses.forEach((response) => {
      const dateKey = formatDate(response.createdAt);

      // Réponses par date
      trends.responsesByDate[dateKey] =
        (trends.responsesByDate[dateKey] || 0) + 1;

      // Réponses par question
      if (!trends.responsesByQuestion[response.questionId]) {
        trends.responsesByQuestion[response.questionId] = {
          questionText: response.questionText,
          count: 0,
          byDate: {},
        };
      }

      trends.responsesByQuestion[response.questionId].count += 1;

      if (!trends.responsesByQuestion[response.questionId].byDate[dateKey]) {
        trends.responsesByQuestion[response.questionId].byDate[dateKey] = 0;
      }

      trends.responsesByQuestion[response.questionId].byDate[dateKey] += 1;
    });

    // Calcul du taux d'achèvement par jour
    // Grouper les réponses par utilisateur et par date
    const userResponses = {};

    filteredResponses.forEach((response) => {
      const dateKey = formatDate(response.createdAt);
      const userId = response.user?.id || 'anonymous';

      if (!userResponses[dateKey]) {
        userResponses[dateKey] = {};
      }

      if (!userResponses[dateKey][userId]) {
        userResponses[dateKey][userId] = new Set();
      }

      userResponses[dateKey][userId].add(response.questionId);
    });

    // Calculer le taux d'achèvement pour chaque date
    Object.keys(userResponses).forEach((dateKey) => {
      const uniqueUsers = Object.keys(userResponses[dateKey]).length;
      let completedSurveys = 0;

      Object.keys(userResponses[dateKey]).forEach((userId) => {
        // Considérer l'enquête comme complétée si l'utilisateur a répondu à toutes les questions
        if (userResponses[dateKey][userId].size === questions.length) {
          completedSurveys += 1;
        }
      });

      trends.completionRateByDate[dateKey] =
        uniqueUsers > 0 ? (completedSurveys / uniqueUsers) * 100 : 0;
    });

    // Préparation des données pour la visualisation
    const chartData = {
      responsesByDate: Object.entries(trends.responsesByDate)
        .map(([date, count]) => ({ date, count }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),

      completionRateByDate: Object.entries(trends.completionRateByDate)
        .map(([date, rate]) => ({ date, rate }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),

      responsesByQuestion: Object.entries(trends.responsesByQuestion).map(
        ([questionId, data]) => ({
          questionId,
          questionText: (data as QuestionTrendData).questionText,
          count: (data as QuestionTrendData).count,
          byDate: Object.entries((data as QuestionTrendData).byDate)
            .map(([date, count]) => ({ date, count }))
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            ),
        }),
      ),
    };

    return {
      ...trends,
      chartData,
    };
  }
}
