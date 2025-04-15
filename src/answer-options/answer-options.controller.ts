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
} from '@nestjs/common';

import { CreateAnswerOptionDto } from './types/dtos/create-answer-option.dto';
import { UpdateAnswerOptionDto } from './types/dtos/update-answer-option.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnswerOption } from './entities/answer-option.entity';
import { AnswerOptionsService } from './answer-options.service';

@ApiTags('answer-options')
@Controller('answer-options')
export class AnswerOptionController {
  constructor(private readonly answerOptionService: AnswerOptionsService) {}

  @ApiOperation({ summary: 'Create a new answer option' })
  @ApiResponse({
    status: 201,
    description: 'The answer option has been successfully created.',
    type: AnswerOption,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAnswerOptionDto: CreateAnswerOptionDto) {
    return this.answerOptionService.create(createAnswerOptionDto);
  }

  @ApiOperation({ summary: 'Get all answer options' })
  @ApiResponse({
    status: 200,
    description: 'Return all answer options.',
    type: [AnswerOption],
  })
  @ApiQuery({
    name: 'questionId',
    required: false,
    description: 'Filter answer options by question ID',
  })
  @ApiQuery({
    name: 'surveyId',
    required: false,
    description: 'Filter answer options by survey ID',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('questionId') questionId?: string,
    @Query('surveyId') surveyId?: string,
  ) {
    if (questionId) {
      return this.answerOptionService.findByQuestion(questionId);
    } else if (surveyId) {
      return this.answerOptionService.findBySurvey(surveyId);
    }
    return this.answerOptionService.findAll();
  }

  @ApiOperation({ summary: 'Get an answer option by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the answer option.',
    type: AnswerOption,
  })
  @ApiResponse({ status: 404, description: 'Answer option not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answerOptionService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an answer option' })
  @ApiResponse({
    status: 200,
    description: 'The answer option has been successfully updated.',
    type: AnswerOption,
  })
  @ApiResponse({ status: 404, description: 'Answer option not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnswerOptionDto: UpdateAnswerOptionDto,
  ) {
    return this.answerOptionService.update(id, updateAnswerOptionDto);
  }

  @ApiOperation({ summary: 'Delete an answer option' })
  @ApiResponse({
    status: 200,
    description: 'The answer option has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Answer option not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answerOptionService.remove(id);
  }
}
