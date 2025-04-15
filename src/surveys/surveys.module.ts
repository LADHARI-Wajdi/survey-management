import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity';

import { SurveyRepository } from './repositories/survey.repository';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';

@Module({
  imports: [TypeOrmModule.forFeature([Survey])],
  controllers: [SurveysController],
  providers: [SurveysService, SurveyRepository],
  exports: [SurveysService, SurveyRepository],
})
export class SurveyModule {}
