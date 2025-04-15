import { Injectable, NotFoundException } from '@nestjs/common';
import { SurveyRepository } from './repositories/survey.repository';
import { CreateSurveyDto } from './types/dtos/create-survey.dto';
import { UpdateSurveyDto } from './types/dtos/update-survey.dto';
import { Survey } from './entities/survey.entity';

@Injectable()
export class SurveysService {
  constructor(private surveyRepository: SurveyRepository) {}

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
    // Correction : Utiliser la notation avec la relation directe
    return this.surveyRepository.find({
      where: { createdBy: userId },
      relations: ['questions'],
    });
  }

  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepository.create(createSurveyDto);
    return this.surveyRepository.save(survey);
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
}
