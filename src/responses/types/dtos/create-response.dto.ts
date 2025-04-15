import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  user?: string;
}
