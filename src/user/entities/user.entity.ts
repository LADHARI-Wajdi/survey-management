import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IUser } from '../types/interfaces/user.interface';
import { Survey } from 'src/surveys/entities/survey.entity';
import { ISurvey } from 'src/surveys/types/interfaces/survey.interface';
import { Response } from 'src/responses/entities/response.entity';
import { IResponse } from 'src/responses/types/interfaces/response.interface';
import { UserRole } from '../types/enums/user-role.enum';
import { genSalt ,hash} from 'bcrypt';
 
@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PARTICIPANT,
  })
  role: UserRole;



  @Column({ default: false })
  admin: boolean;

  @OneToMany(() => Survey, (survey) => survey.createdBy)
  surveys: ISurvey[] | string[];

  @OneToMany(() => Response, (response) => response.user)
  responses: IResponse[] | string[];
}
