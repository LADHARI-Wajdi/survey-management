import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distribution } from './entities/distribution.entity';
import { DistributionService } from './distribution.service';
import { DistributionController } from './distribution.controller';
import { SurveyModule } from '../surveys/surveys.module';
import { UserModule } from '../user/user.module';
import { QRCodeModule } from './qrcode/qrcode.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Distribution]),
    SurveyModule,
    UserModule,
    QRCodeModule,
    ConfigModule,
  ],
  controllers: [DistributionController],
  providers: [DistributionService],
  exports: [DistributionService],
})
export class DistributionModule {}
