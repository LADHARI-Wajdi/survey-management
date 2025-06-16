/* eslint-disable prettier/prettier */
// src/surveys/surveys.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { SurveyRepository } from './repositories/survey.repository';
import { CreateSurveyDto } from './types/dtos/create-survey.dto';
import { UpdateSurveyDto } from './types/dtos/update-survey.dto';
import { Survey } from './entities/survey.entity';
import { SurveyStatus } from './types/enums/survey-status.enum';
import { SurveyType } from './types/enums/survey-type.enum';

@Injectable()
export class SurveysService {


  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepository.create(createSurveyDto);
    return this.surveyRepository.save(survey);
  }
  getRecentSurveys(limit: number) {
    throw new Error('Method not implemented.');
  }
  getPopularSurveys: unknown;
  getTemplates: any;
  constructor(private surveyRepository: SurveyRepository) {}

  // Méthodes existantes
  async findAll(): Promise<Survey[]> {
    return this.surveyRepository.find({
      relations: ['createdBy', 'questions'],
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['createdBy', 'questions', 'questions.answerOptions'],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    return survey;
  }

  async findByUser(userId: string): Promise<Survey[]> {
    return this.surveyRepository.find({
      where: { createdBy: userId },
      relations: ['questions'],
    });
  }

 

  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);
    const updatedSurvey = Object.assign(survey, updateSurveyDto);
    return this.surveyRepository.save(updatedSurvey);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.surveyRepository.remove(survey);
  }

  // Nouvelles méthodes à ajouter

  /**
   * Met à jour le statut d'une enquête (publier, fermer, etc.)
   */
  async updateStatus(id: string, status: SurveyStatus): Promise<Survey> {
    const survey = await this.findOne(id);
    survey.status = status;

    // Si on publie l'enquête, définir la date de début si elle n'est pas déjà définie
    if (status === SurveyStatus.PUBLISHED && !survey.startDate) {
      survey.startDate = new Date();
    }

    // Si on ferme l'enquête, définir la date de fin
    if (status === SurveyStatus.CLOSED) {
      survey.endDate = new Date();
    }

    return this.surveyRepository.save(survey);
  }

  /**
   * Récupère les statistiques d'une enquête
   */
  async getStatistics(id: string): Promise<unknown> {
    const survey = await this.findOne(id);

    // Cette méthode devrait faire appel à un service d'analyse pour obtenir des statistiques
    // Pour cet exemple, nous renvoyons des statistiques de base simulées
    const totalQuestions = survey.questions.length;
    const responseCount = 0; // À remplacer par une vraie requête pour compter les réponses

    return {
      id: survey.id,
      title: survey.title,
      status: survey.status,
      totalQuestions,
      responseCount,
      completionRate: 0, // À calculer
      startDate: survey.startDate,
      endDate: survey.endDate,
      // Autres statistiques...
    };
  }

  /**
   * Duplique une enquête existante
   */
  async duplicate(id: string, newTitle?: string): Promise<Survey> {
    const originalSurvey = await this.findOne(id);

    // Créer une nouvelle enquête basée sur l'originale
    const duplicatedSurvey = this.surveyRepository.create({
      title: newTitle || `Copie de ${originalSurvey.title}`,
      description: originalSurvey.description,
      type: originalSurvey.type,
      status: SurveyStatus.DRAFT, // Toujours démarrer comme brouillon
      createdBy: originalSurvey.createdBy,
      // Ne pas copier les dates de début/fin
    });

    // Sauvegarder la nouvelle enquête
    const savedSurvey = await this.surveyRepository.save(duplicatedSurvey);

    // Vous devriez également dupliquer les questions liées à cette enquête
    // Cela nécessiterait d'injecter le service de questions et de dupliquer chaque question

    return savedSurvey;
  }

  /**
   * Récupère les modèles d'enquêtes
   */
  async findTemplates(): Promise<Survey[]> {
    // Dans un système réel, vous pourriez avoir un champ 'isTemplate' sur l'entité Survey
    // Ici, nous simulerons en récupérant quelques enquêtes existantes
    return this.surveyRepository.find({
      where: { type: SurveyType.TEMPLATE }, // Supposons que vous avez un type spécifique pour les modèles
      take: 10,
      relations: ['questions'],
    });
  }

  /**
   * Récupère les enquêtes récentes
   */
  async findRecent(limit: number = 5): Promise<Survey[]> {
    return this.surveyRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['createdBy'],
    });
  }

  /**
   * Récupère les enquêtes populaires (basées sur le nombre de réponses)
   */
  async findPopular(limit: number = 5): Promise<Survey[]> {

    return this.surveyRepository.find({
      where: { status: SurveyStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['createdBy'],
    });
  }
  
}
