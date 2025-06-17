import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { DistributionService } from './distribution.service';
import { CreateDistributionDto } from './types/dtos/create-distribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Distribution } from './entities/distribution.entity';
import { Admin } from 'typeorm';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/user/types/enums/user-role.enum';
import { DistributionMethod } from './types/enums/distribution-method.enum';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

@ApiTags('distribution')
@Controller('distribution')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @ApiOperation({ summary: 'Create a new distribution' })
  @ApiResponse({
    status: 201,
    description: 'The distribution has been successfully created.',
    type: Distribution,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  create(@Body() createDistributionDto: CreateDistributionDto, @Req() req) {
    // Accéder directement à l'ID de l'utilisateur à partir de la requête
    const userId = req.user.userId;
    // Appeler la méthode create avec deux arguments séparés
    return this.distributionService.create(createDistributionDto, userId);
  }

  @ApiOperation({ summary: 'Get all distributions' })
  @ApiResponse({
    status: 200,
    description: 'Return all distributions.',
    type: [Distribution],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  findAll(@Query('surveyId') surveyId?: string) {
    if (surveyId) {
      return this.distributionService.findBySurvey(surveyId);
    }
    return this.distributionService.findAll();
  }

  @ApiOperation({ summary: 'Get a distribution by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the distribution.',
    type: Distribution,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  findOne(@Param('id') id: string) {
    return this.distributionService.findOne(id);
  }

  @ApiOperation({ summary: 'Send distribution' })
  @ApiResponse({
    status: 200,
    description: 'Distribution sent successfully.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  send(@Param('id') id: string) {
    return this.distributionService.send(id);
  }

  @ApiOperation({ summary: 'Generate QR code' })
  @ApiResponse({
    status: 200,
    description: 'QR code generated successfully.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/qrcode')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  generateQRCode(@Param('id') id: string) {
    return this.distributionService.generateQRCode(id);
  }

  @ApiOperation({ summary: 'Delete a distribution' })
  @ApiResponse({
    status: 200,
    description: 'The distribution has been successfully deleted.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  remove(@Param('id') id: string) {
    return this.distributionService.remove(id);
  }

  @ApiOperation({ summary: 'Get distribution statistics for a survey' })
  @ApiResponse({
    status: 200,
    description: 'Return distribution statistics for the survey.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('stats/:id')
 @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  getDistributionStats(@Param('id') id: string) {
    return this.distributionService.getDistributionStats(id);
  }

  @ApiOperation({ summary: 'Generate a survey distribution link' })
  @ApiResponse({
    status: 201,
    description: 'The distribution link has been successfully created.',
    type: Distribution,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('link')
  @Roles(UserRole.ADMIN, UserRole.INVESTIGATOR) 
  generateLink(@Body() createDistributionDto: CreateDistributionDto, @Req() req) {
    const userId = req.user.userId;
    return this.distributionService.create({
      ...createDistributionDto,
      method: DistributionMethod.LINK
    }, userId);
  }

  @ApiOperation({ summary: 'Get QR code image' })
  @ApiResponse({
    status: 200,
    description: 'Returns the QR code image',
  })
  @Get(':id/qrcode/image')
  async getQRCodeImage(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const distribution = await this.distributionService.findOne(id);
    if (!distribution.qrCodePath) {
      throw new Error('QR code not found');
    }

    const filePath = join(process.cwd(), distribution.qrCodePath);
    if (!existsSync(filePath)) {
      throw new Error('QR code file not found');
    }

    const file = createReadStream(filePath);
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="qrcode-${id}.png"`,
    });
    return new StreamableFile(file);
  }
}
