import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from './entities/analytics.entity';
import { SurveysService } from '../surveys/surveys.service';
import { QuestionsService } from '../questions/questions.service';
import { ResponsesService } from '../responses/responses.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private surveysService: SurveysService,
    private questionsService: QuestionsService,
    private responsesService: ResponsesService,
  ) {}

  async generateSurveyAnalytics(surveyId: string): Promise<Analytics> {
    const survey = await this.surveysService.findOne(surveyId);
    const questions = await this.questionsService.findBySurvey(surveyId);

    const questionStats = {};
    let totalResponses = 0;
    let completionRate = 0;

    for (const question of questions) {
      const responses = await this.responsesService.findByQuestion(question.id);

      questionStats[question.id] = {
        questionText: question.text,
        responseCount: responses.length,
        responseData: this.analyzeResponses(responses, question.type),
      };

      if (question === questions[0]) {
        totalResponses = responses.length;
      }
    }

    if (questions.length > 1 && totalResponses > 0) {
      const lastQuestionResponses =
        questionStats[questions[questions.length - 1].id].responseCount;
      completionRate = (lastQuestionResponses / totalResponses) * 100;
    } else {
      completionRate = 100;
    }

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
      newAnalytics.demographicData = {};
      newAnalytics.averageCompletionTime = 0;

      return this.analyticsRepository.save(newAnalytics);
    } else {
      // Mettre à jour l'instance existante
      analytics.totalResponses = totalResponses;
      analytics.completionRate = completionRate;
      analytics.questionStats = questionStats;

      return this.analyticsRepository.save(analytics);
    }
  }

  private analyzeResponses(responses, questionType) {
    switch (questionType) {
      case 'SINGLE_CHOICE':
      case 'MULTIPLE_CHOICE':
        const frequencyMap = {};
        for (const response of responses) {
          const answers = response.answer.split(',');
          for (const answer of answers) {
            frequencyMap[answer] = (frequencyMap[answer] || 0) + 1;
          }
        }
        return frequencyMap;

      case 'RATING':
        let sum = 0;
        for (const response of responses) {
          sum += parseInt(response.answer, 10);
        }
        const average = responses.length > 0 ? sum / responses.length : 0;
        return { average, count: responses.length };

      default:
        return { count: responses.length };
    }
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
}
