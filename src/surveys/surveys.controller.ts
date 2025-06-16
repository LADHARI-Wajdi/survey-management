/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './types/dtos/create-survey.dto';
import { UpdateSurveyDto } from './types/dtos/update-survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SurveyStatus } from './types/enums/survey-status.enum';
import { Survey } from './entities/survey.entity';
import { DuplicateSurveyDto } from './types/dtos/duplicate-survey.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/types/enums/user-role.enum';
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('surveys')
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @Roles(UserRole.ADMIN) 
  create(@Body() createSurveyDto: CreateSurveyDto) {
     return this.surveysService.create(createSurveyDto);
  }

  @ApiOperation({ summary: 'Get all surveys' })
  @ApiResponse({
    status: 200,
    description: 'Return all surveys',
    type: [Survey],
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter surveys by user ID',
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.surveysService.findByUser(userId);
    }
    var surveys = this.surveysService.findAll();
    return surveys

  }

  @ApiOperation({ summary: 'Get a specific survey by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the specified survey',
    type: Survey,
  })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a survey' })
  @ApiResponse({
    status: 200,
    description: 'Survey updated successfully',
    type: Survey,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveysService.update(id, updateSurveyDto);
  }

  @ApiOperation({ summary: 'Delete a survey' })
  @ApiResponse({ status: 200, description: 'Survey deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }

  @ApiOperation({ summary: 'Publish a survey' })
  @ApiResponse({
    status: 200,
    description: 'Survey published successfully',
    type: Survey,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  publish(@Param('id') id: string) {
    return this.surveysService.updateStatus(id, SurveyStatus.PUBLISHED);
  }

  @ApiOperation({ summary: 'Close a survey' })
  @ApiResponse({
    status: 200,
    description: 'Survey closed successfully',
    type: Survey,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/close')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  close(@Param('id') id: string) {
    return this.surveysService.updateStatus(id, SurveyStatus.CLOSED);
  }

  @ApiOperation({ summary: 'Archive a survey' })
  @ApiResponse({
    status: 200,
    description: 'Survey archived successfully',
    type: Survey,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  archive(@Param('id') id: string) {
    return this.surveysService.updateStatus(id, SurveyStatus.ARCHIVED);
  }

  @ApiOperation({ summary: 'Duplicate a survey' })
  @ApiResponse({
    status: 201,
    description: 'Survey duplicated successfully',
    type: Survey,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  duplicate(
    @Param('id') id: string,
    @Body() duplicateSurveyDto: DuplicateSurveyDto,
  ) {
    return this.surveysService.duplicate(id, duplicateSurveyDto.title);
  }

  @ApiOperation({ summary: 'Get survey templates' })
  @ApiResponse({
    status: 200,
    description: 'Return all survey templates',
    type: [Survey],
  })
  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  getTemplates() {
    return this.surveysService.getTemplates();
  }

  @ApiOperation({ summary: 'Get recent surveys' })
  @ApiResponse({
    status: 200,
    description: 'Return recent surveys',
    type: [Survey],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of surveys returned',
  })
  @Get('recent')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  getRecentSurveys(@Query('limit') limit: number = 5) {
    return this.surveysService.getRecentSurveys(limit);
  }

  @ApiOperation({ summary: 'Get popular surveys' })
  @ApiResponse({
    status: 200,
    description: 'Return popular surveys',
    type: [Survey],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit the number of surveys returned',
  })
  @Get('popular')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  getPopularSurveys(@Query('limit') limit: number = 5) {
    return this.surveysService.findPopular(limit);
  }
}
