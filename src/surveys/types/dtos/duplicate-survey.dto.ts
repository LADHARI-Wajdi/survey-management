import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DuplicateSurveyDto {
  @ApiPropertyOptional({ description: 'Title for the duplicate survey' })
  @IsString()
  @IsOptional()
  title?: string;
}
