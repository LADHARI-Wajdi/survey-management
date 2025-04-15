import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAnswerOptionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  survey?: string;
}
