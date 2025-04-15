import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerOption } from './entities/answer-option.entity';
import { CreateAnswerOptionDto } from './types/dtos/create-answer-option.dto';
import { UpdateAnswerOptionDto } from './types/dtos/update-answer-option.dto';

@Injectable()
export class AnswerOptionsService {
  constructor(
    @InjectRepository(AnswerOption)
    private answerOptionRepository: Repository<AnswerOption>,
  ) {}

  async create(
    createAnswerOptionDto: CreateAnswerOptionDto,
  ): Promise<AnswerOption> {
    const answerOption = this.answerOptionRepository.create(
      createAnswerOptionDto,
    );
    return this.answerOptionRepository.save(answerOption);
  }

  async findAll(): Promise<AnswerOption[]> {
    return this.answerOptionRepository.find({
      relations: ['question', 'survey'],
    });
  }

  async findOne(id: string): Promise<AnswerOption> {
    const answerOption = await this.answerOptionRepository.findOne({
      where: { id },
      relations: ['question', 'survey'],
    });

    if (!answerOption) {
      throw new NotFoundException();
    }

    return answerOption;
  }

  async findByQuestion(questionId: string): Promise<AnswerOption[]> {
    return this.answerOptionRepository.find({
      where: { question: questionId },
    });
  }

  async findBySurvey(surveyId: string): Promise<AnswerOption[]> {
    return this.answerOptionRepository.find({
      where: { survey: surveyId },
      relations: ['question'],
    });
  }

  async update(
    id: string,
    updateAnswerOptionDto: UpdateAnswerOptionDto,
  ): Promise<AnswerOption> {
    const answerOption = await this.findOne(id);
    Object.assign(answerOption, updateAnswerOptionDto);
    return this.answerOptionRepository.save(answerOption);
  }

  async remove(id: string): Promise<void> {
    const result = await this.answerOptionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
