import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity';

import { SurveyRepository } from './repositories/survey.repository';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Survey]),JwtModule],
  controllers: [SurveysController],
  providers: [SurveysService, SurveyRepository,JwtService],
  exports: [SurveysService, SurveyRepository],
})
export class SurveyModule {}
