import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DistributionMethod } from '../enums/distribution-method.enum';

export class CreateDistributionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  surveyId: string;

  @ApiProperty({ enum: DistributionMethod })
  @IsEnum(DistributionMethod)
  @IsNotEmpty()
  method: DistributionMethod;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emailTemplate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emailSubject?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  recipients?: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledDate?: Date;
}
