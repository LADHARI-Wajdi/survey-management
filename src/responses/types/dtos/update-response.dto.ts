import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateResponseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  answer?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  user?: string;
}
