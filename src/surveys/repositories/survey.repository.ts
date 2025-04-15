import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Survey } from '../entities/survey.entity';

@Injectable()
export class SurveyRepository extends Repository<Survey> {
  constructor(private dataSource: DataSource) {
    super(Survey, dataSource.createEntityManager());
  }
}
