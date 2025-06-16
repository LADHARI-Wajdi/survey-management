import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
import { DistributionModule } from './distribution/distribution.module';
import { JwtModule } from '@nestjs/jwt';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_DATABASE || 'survey',
      entities: [User, Survey, Question, Response, Analytics, AnswerOption],
      synchronize: process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOGGING === 'true',
      autoLoadEntities: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UserModule,
    SurveyModule,
    QuestionModule,
    ResponseModule,
    AnalyticsModule,
    AnswerOptionModule,
    DistributionModule,
    AuthModule,
    JwtModule,
    InvitationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
