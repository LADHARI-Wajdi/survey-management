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
import { DistributionMethod } from '../types/enums/distribution-method.enum';
import { DistributionStatus } from '../types/enums/distribution-status.enum';

@Entity()
export class Distribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: DistributionMethod,
    default: DistributionMethod.LINK,
  })
  method: DistributionMethod;

  @Column({
    type: 'enum',
    enum: DistributionStatus,
    default: DistributionStatus.PENDING,
  })
  status: DistributionStatus;

  @Column({ nullable: true })
  emailTemplate: string;

  @Column({ nullable: true })
  emailSubject: string;

  @Column({ type: 'json', nullable: true })
  recipients: string[];

  @Column({ nullable: true })
  publicLink: string;

  @Column({ nullable: true })
  qrCodePath: string;

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  openedCount: number;

  @Column({ default: 0 })
  completedCount: number;

  @ManyToOne(() => Survey)
  survey: Survey;

  @ManyToOne(() => User)
  createdBy: User;
}
