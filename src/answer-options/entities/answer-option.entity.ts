import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Question } from 'src/questions/entities/question.entity';
import { IQuestion } from 'src/questions/types/interfaces/question.interface';
import { Survey } from 'src/surveys/entities/survey.entity';
import { ISurvey } from 'src/surveys/types/interfaces/survey.interface';
import { IAnswerOption } from '../types/interfaces/answer-option.interfaces';

@Entity()
export class AnswerOption implements IAnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  value: string;

  @ManyToOne(() => Question, (question) => question.answerOptions)
  question: IQuestion | string;

  @ManyToOne(() => Survey, (survey) => survey.answerOptions)
  survey: ISurvey | string;
}
