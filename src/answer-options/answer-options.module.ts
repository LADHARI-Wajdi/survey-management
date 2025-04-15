import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerOption } from './entities/answer-option.entity';

import { AnswerOptionRepository } from './repositories/answer-option.repository';
import { AnswerOptionController } from './answer-options.controller';
import { AnswerOptionsService } from './answer-options.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnswerOption])],
  controllers: [AnswerOptionController],
  providers: [AnswerOptionsService, AnswerOptionRepository],
  exports: [AnswerOptionsService, AnswerOptionRepository],
})
export class AnswerOptionModule {}
