import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  surveyId: string;

  @Column({ nullable: true, default: 0 })
  totalResponses: number;

  @Column({ nullable: true, default: 0 })
  completionRate: number;

  @Column({ type: 'json', nullable: true })
  questionStats: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  demographicData: Record<string, any>;

  @Column({ nullable: true, default: 0 })
  averageCompletionTime: number;
}
