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
}
