import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distribution } from './entities/distribution.entity';
import { CreateDistributionDto } from './types/dtos/create-distribution.dto';
import { SurveysService } from '../surveys/surveys.service';
import { UserService } from '../user/user.service';
import { DistributionStatus } from './types/enums/distribution-status.enum';
import { DistributionMethod } from './types/enums/distribution-method.enum';
import { QRCodeService } from './qrcode/qrcode.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);

  constructor(
    @InjectRepository(Distribution)
    private distributionRepository: Repository<Distribution>,
    private surveysService: SurveysService,
    private userService: UserService,
    private qrCodeService: QRCodeService,
    private configService: ConfigService,
  ) {}

  async create(createDistributionDto: CreateDistributionDto, userId: string): Promise<Distribution> {
    const survey = await this.surveysService.findOne(createDistributionDto.surveyId);
    const user = await this.userService.findOne(userId);

    const distribution = this.distributionRepository.create({
      method: createDistributionDto.method,
      emailTemplate: createDistributionDto.emailTemplate,
      emailSubject: createDistributionDto.emailSubject,
      recipients: createDistributionDto.recipients,
      scheduledDate: createDistributionDto.scheduledDate,
      survey,
      createdBy: user,
      status: createDistributionDto.scheduledDate
        ? DistributionStatus.SCHEDULED
        : DistributionStatus.PENDING,
    });

    if (distribution.method === DistributionMethod.LINK) {
      const baseUrl = this.configService.get(
        'FRONTEND_URL',
        'http://localhost:3000',
      );
      distribution.publicLink = `${baseUrl}/surveys/${survey.id}`;
    }

    const savedDistribution =
      await this.distributionRepository.save(distribution);

    // Generate QR code if method is QR_CODE
    if (distribution.method === DistributionMethod.QR_CODE) {
      await this.generateQRCode(savedDistribution.id);
    }

    return savedDistribution;
  }

  async findAll(): Promise<Distribution[]> {
    return this.distributionRepository.find({
      relations: ['survey', 'createdBy'],
    });
  }

  async findOne(id: string): Promise<Distribution> {
    const distribution = await this.distributionRepository.findOne({
      where: { id },
      relations: ['survey', 'createdBy'],
    });

    if (!distribution) {
      throw new NotFoundException(`Distribution with ID ${id} not found`);
    }

    return distribution;
  }

  async findBySurvey(surveyId: string): Promise<Distribution[]> {
    return this.distributionRepository.find({
      where: { survey: { id: surveyId } },
      relations: ['createdBy'],
    });
  }

  async send(id: string): Promise<Distribution> {
    const distribution = await this.findOne(id);

    // Ici, dans une version future, vous pourriez intégrer l'envoi d'emails
    // Pour l'instant, nous mettons simplement à jour le statut

    distribution.status = DistributionStatus.SENT;
    distribution.sentCount = distribution.recipients?.length || 0;

    return this.distributionRepository.save(distribution);
  }

  async generateQRCode(id: string): Promise<Distribution> {
    this.logger.debug(`Starting QR code generation for distribution ID: ${id}`);
    
    const distribution = await this.findOne(id);
    this.logger.debug(`Found distribution: ${JSON.stringify(distribution)}`);

    if (!distribution.publicLink) {
      const baseUrl = this.configService.get(
        'FRONTEND_URL',
        'http://localhost:3000',
      );
      distribution.publicLink = `${baseUrl}/surveys/${distribution.survey.id}`;
      this.logger.debug(`Generated public link: ${distribution.publicLink}`);
    }

    this.logger.debug(`Generating QR code for link: ${distribution.publicLink}`);
    const qrCodePath = await this.qrCodeService.generateQRCode(
      distribution.publicLink,
      distribution.id,
    );
    this.logger.debug(`QR code generated at path: ${qrCodePath}`);

    distribution.qrCodePath = qrCodePath;
    distribution.method = DistributionMethod.QR_CODE;

    const savedDistribution = await this.distributionRepository.save(distribution);
    this.logger.debug(`Distribution updated with QR code path: ${savedDistribution.qrCodePath}`);

    return savedDistribution;
  }

  async remove(id: string): Promise<void> {
    const result = await this.distributionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Distribution with ID ${id} not found`);
    }
  }

  async getDistributionStats(surveyId: string): Promise<any> {
    const distributions = await this.distributionRepository.find({
      where: { survey: { id: surveyId } },
      relations: ['survey'],
    });

    const stats = {
      totalDistributions: distributions.length,
      totalViews: distributions.reduce((sum, d) => sum + d.openedCount, 0),
      totalResponses: distributions.reduce((sum, d) => sum + d.completedCount, 0),
      conversionRate: 0,
      qrCodeScans: distributions.filter(d => d.method === DistributionMethod.QR_CODE)
        .reduce((sum, d) => sum + d.openedCount, 0),
      byMethod: {
        [DistributionMethod.LINK]: {
          distributions: distributions.filter(d => d.method === DistributionMethod.LINK).length,
          views: distributions.filter(d => d.method === DistributionMethod.LINK)
            .reduce((sum, d) => sum + d.openedCount, 0),
          responses: distributions.filter(d => d.method === DistributionMethod.LINK)
            .reduce((sum, d) => sum + d.completedCount, 0),
          conversionRate: 0
        },
        [DistributionMethod.QR_CODE]: {
          distributions: distributions.filter(d => d.method === DistributionMethod.QR_CODE).length,
          views: distributions.filter(d => d.method === DistributionMethod.QR_CODE)
            .reduce((sum, d) => sum + d.openedCount, 0),
          responses: distributions.filter(d => d.method === DistributionMethod.QR_CODE)
            .reduce((sum, d) => sum + d.completedCount, 0),
          conversionRate: 0
        }
      }
    };

    // Calculate conversion rates
    if (stats.totalViews > 0) {
      stats.conversionRate = (stats.totalResponses / stats.totalViews) * 100;
    }
    if (stats.byMethod[DistributionMethod.LINK].views > 0) {
      stats.byMethod[DistributionMethod.LINK].conversionRate = 
        (stats.byMethod[DistributionMethod.LINK].responses / stats.byMethod[DistributionMethod.LINK].views) * 100;
    }
    if (stats.byMethod[DistributionMethod.QR_CODE].views > 0) {
      stats.byMethod[DistributionMethod.QR_CODE].conversionRate = 
        (stats.byMethod[DistributionMethod.QR_CODE].responses / stats.byMethod[DistributionMethod.QR_CODE].views) * 100;
    }

    return stats;
  }
}
