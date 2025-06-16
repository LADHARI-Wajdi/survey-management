import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from './entities/analytics.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SurveyModule } from 'src/surveys/surveys.module';
import { QuestionModule } from 'src/questions/questions.module';
import { ResponseModule } from 'src/responses/responses.module';
import { UserModule } from 'src/user/user.module'; // Ajoutez cette ligne

@Module({
  imports: [
    TypeOrmModule.forFeature([Analytics]),
    SurveyModule,
    QuestionModule,
    ResponseModule,
    UserModule, // Ajoutez cette ligne
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}