import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Survey } from '../../surveys/entities/survey.entity';
import { User } from '../../user/entities/user.entity';
import { InvitationStatus } from '../types/enums/invitation-status.enum';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  openDate: Date;

  @Column({ nullable: true })
  clickDate: Date;

  @Column({ default: 0 })
  reminderCount: number;

  @Column({ nullable: true })
  lastReminderAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToOne(() => Survey)
  survey: Survey;

  @ManyToOne(() => User)
  sentBy: User;
}
