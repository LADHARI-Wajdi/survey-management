import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Analytics } from './entities/analytics.entity';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({})
  @ApiResponse({ status: 200, type: Analytics })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id')
  getSurveyAnalytics(@Param('id') id: string) {
    return this.analyticsService.getSurveyAnalytics(id);
  }

  @ApiOperation({})
  @ApiResponse({ status: 200, type: Analytics })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('survey/:id/generate')
  generateSurveyAnalytics(@Param('id') id: string) {
    return this.analyticsService.getSurveyAnalytics(id);
  }
}
