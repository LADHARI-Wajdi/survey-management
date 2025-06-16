import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { AnswerOption } from '../answer-options/entities/answer-option.entity';
import { Survey } from '../surveys/entities/survey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, AnswerOption, Survey])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionModule {}