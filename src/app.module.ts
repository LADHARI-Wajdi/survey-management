/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user/entities/user.entity';
import { Survey } from './surveys/entities/survey.entity';
import { Question } from './questions/entities/question.entity';
import { Response } from './responses/entities/response.entity';
import { Analytics } from './analytics/entities/analytics.entity';
import { AnswerOption } from './answer-options/entities/answer-option.entity';
import { SurveyModule } from './surveys/surveys.module';
import { QuestionModule } from './questions/questions.module';
import { ResponseModule } from './responses/responses.module';
import { AnswerOptionModule } from './answer-options/answer-options.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'survey',
      entities: [User, Survey, Question, Response, Analytics, AnswerOption],
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
    }),
    UserModule,
    SurveyModule,
    QuestionModule,
    ResponseModule,
    AnalyticsModule,
    AnswerOptionModule,
    AuthModule,
    JwtModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}