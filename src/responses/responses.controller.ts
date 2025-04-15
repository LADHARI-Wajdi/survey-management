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
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './types/dtos/create-response.dto';
import { UpdateResponseDto } from './types/dtos/update-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from './entities/response.entity';

@ApiTags('responses')
@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @ApiOperation({})
  @ApiResponse({ status: 201, type: Response })
  @Post()
  create(@Body() createResponseDto: CreateResponseDto) {
    return this.responsesService.create(createResponseDto);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: [Response] })
  @ApiQuery({ name: 'questionId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @Get()
  findAll(
    @Query('questionId') questionId?: string,
    @Query('userId') userId?: string,
  ) {
    if (questionId) {
      return this.responsesService.findByQuestion(questionId);
    } else if (userId) {
      return this.responsesService.findByUser(userId);
    }
    return this.responsesService.findAll();
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: Response })
  @ApiResponse({ status: 404 })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: Response })
  @ApiResponse({ status: 404 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResponseDto: UpdateResponseDto,
  ) {
    return this.responsesService.update(id, updateResponseDto);
  }

  @ApiOperation({})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.responsesService.remove(id);
  }
}
