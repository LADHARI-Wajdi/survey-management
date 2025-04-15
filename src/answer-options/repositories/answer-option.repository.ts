import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnswerOption } from '../entities/answer-option.entity';

@Injectable()
export class AnswerOptionRepository extends Repository<AnswerOption> {
  constructor(private dataSource: DataSource) {
    super(AnswerOption, dataSource.createEntityManager());
  }
}
