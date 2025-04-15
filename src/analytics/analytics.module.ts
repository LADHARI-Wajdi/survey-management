import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from './entities/analytics.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SurveyModule } from 'src/surveys/surveys.module';
import { QuestionModule } from 'src/questions/questions.module';
import { ResponseModule } from 'src/responses/responses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analytics]),
    SurveyModule,
    QuestionModule,
    ResponseModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
