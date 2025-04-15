import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAnswerOptionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  survey: string;
}
