import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IQuestion } from '../types/interfaces/question.interface';
import { Survey } from 'src/surveys/entities/survey.entity';
import { ISurvey } from 'src/surveys/types/interfaces/survey.interface';
import { Response } from 'src/responses/entities/response.entity';
import { IResponse } from 'src/responses/types/interfaces/response.interface';
import { QuestionType } from '../types/enums/question-type.enum';
import { AnswerOption } from 'src/answer-options/entities/answer-option.entity';
import { IAnswerOption } from 'src/answer-options/types/interfaces/answer-option.interfaces';


@Entity()
export class Question implements IQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.TEXT,
  })
  type: QuestionType;

  @Column({ default: true })
  isRequired: boolean;

  @ManyToOne(() => Survey, (survey) => survey.questions)
  survey: ISurvey | string;

  @OneToMany(() => Response, (response) => response.question)
  responses: IResponse[] | string[];

  @OneToMany(() => AnswerOption, (answerOption) => answerOption.question)
  answerOptions: IAnswerOption[] | string[];
}
