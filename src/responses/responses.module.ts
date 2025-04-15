import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Response } from './entities/response.entity';

import { ResponseRepository } from './repositories/response.repository';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Response])],
  controllers: [ResponsesController],
  providers: [ResponsesService, ResponseRepository],
  exports: [ResponsesService, ResponseRepository],
})
export class ResponseModule {}
