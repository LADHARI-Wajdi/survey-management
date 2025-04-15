import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class AnalyticsDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  surveyId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalResponses: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  completionRate?: number;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  questionStats?: Record<string, any>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  demographicData?: Record<string, any>;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  averageCompletionTime?: number;
}
