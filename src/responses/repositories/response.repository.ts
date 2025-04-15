import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Response } from '../entities/response.entity';

@Injectable()
export class ResponseRepository extends Repository<Response> {
  constructor(private dataSource: DataSource) {
    super(Response, dataSource.createEntityManager());
  }
}
