import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Res,
  StreamableFile,
  Query,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Analytics } from './entities/analytics.entity';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/user/types/enums/user-role.enum';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Obtenir les analyses pour une enquête' })
  @ApiResponse({ status: 200, type: Analytics })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  
  getSurveyAnalytics(@Param('id') id: string) {
    return this.analyticsService.getSurveyAnalytics(id);
  }

  @ApiOperation({ summary: 'Générer les analyses pour une enquête' })
  @ApiResponse({ status: 200, type: Analytics })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('survey/:id/generate')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  
  generateSurveyAnalytics(@Param('id') id: string) {
    return this.analyticsService.generateSurveyAnalytics(id);
  }

  @ApiOperation({ summary: "Télécharger les résultats de l'enquête en CSV" })
  @ApiResponse({ status: 200, description: 'Fichier CSV des résultats' })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id/export/csv')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  async downloadCsv(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const analytics = await this.analyticsService.getSurveyAnalytics(id);

    if (!analytics.exportPaths?.csv) {
      await this.analyticsService.generateSurveyAnalytics(id);
      const updatedAnalytics =
        await this.analyticsService.getSurveyAnalytics(id);
      return this.serveFile(
        updatedAnalytics.exportPaths.csv,
        `survey_${id}_results.csv`,
        'text/csv',
        res,
      );
    }

    return this.serveFile(
      analytics.exportPaths.csv,
      `survey_${id}_results.csv`,
      'text/csv',
      res,
    );
  }

  @ApiOperation({ summary: "Télécharger les résultats de l'enquête en Excel" })
  @ApiResponse({ status: 200, description: 'Fichier Excel des résultats' })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id/export/excel')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  async downloadExcel(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const analytics = await this.analyticsService.getSurveyAnalytics(id);

    if (!analytics.exportPaths?.excel) {
      await this.analyticsService.generateSurveyAnalytics(id);
      const updatedAnalytics =
        await this.analyticsService.getSurveyAnalytics(id);
      return this.serveFile(
        updatedAnalytics.exportPaths.excel,
        `survey_${id}_results.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        res,
      );
    }

    return this.serveFile(
      analytics.exportPaths.excel,
      `survey_${id}_results.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      res,
    );
  }

  @ApiOperation({ summary: "Télécharger le rapport PDF de l'enquête" })
  @ApiResponse({ status: 200, description: 'Rapport PDF des résultats' })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id/export/pdf')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  async downloadPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const analytics = await this.analyticsService.getSurveyAnalytics(id);

    if (!analytics.exportPaths?.pdf) {
      await this.analyticsService.generateSurveyAnalytics(id);
      const updatedAnalytics =
        await this.analyticsService.getSurveyAnalytics(id);
      return this.serveFile(
        updatedAnalytics.exportPaths.pdf,
        `survey_${id}_report.pdf`,
        'application/pdf',
        res,
      );
    }

    return this.serveFile(
      analytics.exportPaths.pdf,
      `survey_${id}_report.pdf`,
      'application/pdf',
      res,
    );
  }

  @ApiOperation({
    summary: 'Obtenir des statistiques spécifiques pour une question',
  })
  @ApiResponse({ status: 200, description: 'Statistiques de la question' })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiParam({ name: 'questionId', description: 'ID de la question' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id/question/:questionId')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  async getQuestionStats(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
  ) {
    const analytics = await this.analyticsService.getSurveyAnalytics(id);

    if (!analytics.questionStats || !analytics.questionStats[questionId]) {
      return { error: 'Question statistics not found' };
    }

    return analytics.questionStats[questionId];
  }

  @ApiOperation({
    summary: 'Obtenir des données démographiques pour une enquête',
  })
  @ApiResponse({ status: 200, description: 'Données démographiques' })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id/demographics')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  async getDemographics(@Param('id') id: string) {
    const analytics = await this.analyticsService.getSurveyAnalytics(id);
    return (
      analytics.demographicData || { message: 'No demographic data available' }
    );
  }

  @ApiOperation({
    summary: "Obtenir les tendances d'évolution des réponses dans le temps",
  })
  @ApiResponse({ status: 200, description: 'Données de tendances' })
  @ApiParam({ name: 'id', description: "ID de l'enquête" })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month'], required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('survey/:id/trends')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 

  async getTrends(
    @Param('id') id: string,
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.analyticsService.getSurveyTrends(id, period);
  }

  private serveFile(
    filePath: string,
    fileName: string,
    contentType: string,
    res: Response,
  ): StreamableFile {
    const file = createReadStream(join(filePath));

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(file);
  }
}
