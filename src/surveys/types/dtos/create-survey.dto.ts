import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SurveyStatus } from '../enums/survey-status.enum';
import { SurveyType } from '../enums/survey-type.enum';

export class CreateSurveyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: SurveyStatus, default: SurveyStatus.DRAFT })
  @IsEnum(SurveyStatus)
  @IsOptional()
  status?: SurveyStatus;

  @ApiPropertyOptional({ enum: SurveyType, default: SurveyType.GENERAL })
  @IsEnum(SurveyType)
  @IsOptional()
  type?: SurveyType;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  
  // createdBy: string;
}
