import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvitationStatus } from '../enums/invitation-status.enum';

export class UpdateInvitationStatusDto {
  @ApiProperty({ enum: InvitationStatus })
  @IsEnum(InvitationStatus)
  @IsNotEmpty()
  status: InvitationStatus;
}
