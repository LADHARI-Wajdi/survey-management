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
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/user/types/enums/user-role.enum';

@ApiTags('responses')
@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @ApiOperation({})
  @ApiResponse({ status: 201, type: Response })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 
  
  create(@Body() createResponseDto: CreateResponseDto) {
    return this.responsesService.create(createResponseDto);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: [Response] })
  @ApiQuery({ name: 'questionId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 

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
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 

  findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: Response })
  @ApiResponse({ status: 404 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 

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
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR,UserRole.PARTICIPANT) 

  remove(@Param('id') id: string) {
    return this.responsesService.remove(id);
  }
}
