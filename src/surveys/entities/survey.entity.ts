import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ISurvey } from '../types/interfaces/survey.interface';
import { User } from 'src/user/entities/user.entity';
import { IUser } from 'src/user/types/interfaces/user.interface';
import { Question } from 'src/questions/entities/question.entity';
import { IQuestion } from 'src/questions/types/interfaces/question.interface';
import { SurveyStatus } from '../types/enums/survey-status.enum';
import { SurveyType } from '../types/enums/survey-type.enum';
import { AnswerOption } from 'src/answer-options/entities/answer-option.entity';
import { IAnswerOption } from 'src/answer-options/types/interfaces/answer-option.interfaces';


@Entity()
export class Survey implements ISurvey {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SurveyStatus,
    default: SurveyStatus.DRAFT,
  })
  status: SurveyStatus;

  @Column({
    type: 'enum',
    enum: SurveyType,
    default: SurveyType.GENERAL,
  })
  type: SurveyType;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @ManyToOne(() => User, (user) => user.surveys)
  createdBy: IUser | string;

  @OneToMany(() => Question, (question) => question.survey)
  questions: IQuestion[] | string[];

  @OneToMany(() => AnswerOption, (answerOption) => answerOption.survey)
  answerOptions: IAnswerOption[] | string[];
}
