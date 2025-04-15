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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './types/dtos/create-question.dto';
import { UpdateQuestionDto } from './types/dtos/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Question } from './entities/question.entity';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @ApiOperation({})
  @ApiResponse({ status: 201, type: Question })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: [Question] })
  @ApiQuery({ name: 'surveyId', required: false })
  @Get()
  findAll(@Query('surveyId') surveyId?: string) {
    if (surveyId) {
      return this.questionsService.findBySurvey(surveyId);
    }
    return this.questionsService.findAll();
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: Question })
  @ApiResponse({ status: 404 })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: Question })
  @ApiResponse({ status: 404 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
