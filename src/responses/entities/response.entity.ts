import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IResponse } from '../types/interfaces/response.interface';
import { Question } from 'src/questions/entities/question.entity';
import { IQuestion } from 'src/questions/types/interfaces/question.interface';
import { User } from 'src/user/entities/user.entity';
import { IUser } from 'src/user/types/interfaces/user.interface';

@Entity()
export class Response implements IResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  answer: string;

  @ManyToOne(() => Question, (question) => question.responses)
  question: IQuestion | string;

  @ManyToOne(() => User, (user) => user.responses, { nullable: true })
  user: IUser | string | null;
}
