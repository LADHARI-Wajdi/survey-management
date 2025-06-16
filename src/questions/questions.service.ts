import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './types/dtos/create-question.dto';
import { UpdateQuestionDto } from './types/dtos/update-question.dto';
import { AnswerOption } from '../answer-options/entities/answer-option.entity';
import { Survey } from '../surveys/entities/survey.entity';
import { Put } from '@nestjs/common';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(AnswerOption)
    private answerOptionRepository: Repository<AnswerOption>,
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    private dataSource: DataSource
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the question
      const question = new Question();
      question.text = createQuestionDto.text;
      question.description = createQuestionDto.description;
      question.type = createQuestionDto.type;
      question.isRequired = createQuestionDto.isRequired;
      question.order = createQuestionDto.order;

      // If survey ID is provided, verify it exists
      if (createQuestionDto.survey) {
        const survey = await this.surveyRepository.findOne({
          where: { id: createQuestionDto.survey }
        });
        if (!survey) {
          throw new BadRequestException(`Survey with ID ${createQuestionDto.survey} not found`);
        }
        question.survey = survey;
      }

      const savedQuestion = await queryRunner.manager.save(question);

      // Create answer options if provided
      if (createQuestionDto.options && createQuestionDto.options.length > 0) {
        const answerOptions = createQuestionDto.options.map(option => {
          const answerOption = new AnswerOption();
          answerOption.text = option.text;
          answerOption.value = option.value || option.text;
          answerOption.question = savedQuestion;
          answerOption.survey = question.survey;
          return answerOption;
        });
        await queryRunner.manager.save(answerOptions);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedQuestion.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({
      relations: ['survey', 'answerOptions'],
    });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['survey', 'answerOptions'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async findBySurvey(surveyId: string): Promise<Question[]> {
    return this.questionRepository.find({
      where: { survey: surveyId },
      relations: ['answerOptions'],
    });
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.findOne(id);
    Object.assign(question, updateQuestionDto);
    return this.questionRepository.save(question);
  }

  async remove(id: string): Promise<void> {
    const result = await this.questionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  }
}
