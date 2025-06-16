import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './types/dtos/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Invitation } from './entities/invitation.entity';
import { UpdateInvitationStatusDto } from './types/dtos/update-invitation-status.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/user/types/enums/user-role.enum';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @ApiOperation({ summary: 'Create new invitations' })
  @ApiResponse({
    status: 201,
    description: 'The invitations have been successfully created.',
    type: [Invitation],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  create(@Body() createInvitationDto: CreateInvitationDto, @Req() req) {
    return this.invitationService.create(createInvitationDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Get all invitations' })
  @ApiResponse({
    status: 200,
    description: 'Return all invitations.',
    type: [Invitation],
  })
  @ApiQuery({ name: 'surveyId', required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  findAll(@Query('surveyId') surveyId?: string) {
    if (surveyId) {
      return this.invitationService.findBySurvey(surveyId);
    }
    return this.invitationService.findAll();
  }

  @ApiOperation({ summary: 'Get an invitation by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the invitation.',
    type: Invitation,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  findOne(@Param('id') id: string) {
    return this.invitationService.findOne(id);
  }

  @ApiOperation({ summary: 'Validate an invitation token' })
  @ApiResponse({
    status: 200,
    description: 'Return the invitation if token is valid.',
    type: Invitation,
  })
  @Get('validate/:token')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  validateToken(@Param('token') token: string) {
    return this.invitationService.trackInvitationClick(token);
  }

  @ApiOperation({ summary: 'Mark an invitation as completed' })
  @ApiResponse({
    status: 200,
    description: 'The invitation has been marked as completed.',
    type: Invitation,
  })
  @Post('complete/:token')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  markAsCompleted(@Param('token') token: string) {
    return this.invitationService.markAsCompleted(token);
  }

  @ApiOperation({ summary: 'Update invitation status' })
  @ApiResponse({
    status: 200,
    description: 'The invitation status has been updated.',
    type: Invitation,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInvitationStatusDto,
  ) {
    return this.invitationService.updateStatus(id, updateStatusDto);
  }

  @ApiOperation({ summary: 'Send a reminder for an invitation' })
  @ApiResponse({
    status: 200,
    description: 'Reminder has been sent.',
    type: Invitation,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/remind')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  sendReminder(@Param('id') id: string) {
    return this.invitationService.sendReminder(id);
  }

  @ApiOperation({ summary: 'Delete an invitation' })
  @ApiResponse({
    status: 200,
    description: 'The invitation has been successfully deleted.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  remove(@Param('id') id: string) {
    return this.invitationService.remove(id);
  }
}
