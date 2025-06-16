import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ description: 'Email recipient list' })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  emails: string[];

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  surveyId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
