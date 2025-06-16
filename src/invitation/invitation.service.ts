import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './types/dtos/create-invitation.dto';
import { SurveysService } from '../surveys/surveys.service';
import { UserService } from '../user/user.service';
import { InvitationStatus } from './types/enums/invitation-status.enum';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UpdateInvitationStatusDto } from './types/dtos/update-invitation-status.dto';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private surveysService: SurveysService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto,
    userId: string,
  ): Promise<Invitation[]> {
    const survey = await this.surveysService.findOne(
      createInvitationDto.surveyId,
    );
    const user = await this.userService.findOne(userId);

    const invitations: Invitation[] = [];

    for (const email of createInvitationDto.emails) {
      // Générer un token unique pour l'invitation
      const token = uuidv4();

      // Créer l'invitation
      const invitation = this.invitationRepository.create({
        email,
        token,
        message: createInvitationDto.message,
        status: InvitationStatus.PENDING,
        survey,
        sentBy: user,
        expiresAt: createInvitationDto.expiresAt,
      });

      invitations.push(await this.invitationRepository.save(invitation));
    }

    return invitations;
  }

  async findAll(): Promise<Invitation[]> {
    return this.invitationRepository.find({
      relations: ['survey', 'sentBy'],
    });
  }

  async findOne(id: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id },
      relations: ['survey', 'sentBy'],
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }

    return invitation;
  }

  async findByToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ['survey'],
    });

    if (!invitation) {
      throw new NotFoundException(`Invalid invitation token`);
    }

    return invitation;
  }

  async findBySurvey(surveyId: string): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: { survey: { id: surveyId } },
      relations: ['sentBy'],
    });
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateInvitationStatusDto,
  ): Promise<Invitation> {
    const invitation = await this.findOne(id);

    invitation.status = updateStatusDto.status;

    if (updateStatusDto.status === InvitationStatus.SENT) {
      invitation.sentAt = new Date();
    } else if (updateStatusDto.status === InvitationStatus.COMPLETED) {
      invitation.completedAt = new Date();
    }

    return this.invitationRepository.save(invitation);
  }

  async trackInvitationClick(token: string): Promise<Invitation> {
    const invitation = await this.findByToken(token);

    // Vérifier si l'invitation n'a pas expiré
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new Error('This invitation has expired');
    }

    invitation.status = InvitationStatus.CLICKED;
    return this.invitationRepository.save(invitation);
  }

  async markAsCompleted(token: string): Promise<Invitation> {
    const invitation = await this.findByToken(token);

    invitation.status = InvitationStatus.COMPLETED;
    invitation.completedAt = new Date();
    return this.invitationRepository.save(invitation);
  }

  async sendReminder(id: string): Promise<Invitation> {
    const invitation = await this.findOne(id);

    // Ici, nous simulons l'envoi d'un rappel, mais sans l'envoi réel d'email
    // Vous pourriez ajouter cette fonctionnalité plus tard

    invitation.reminderCount += 1;
    invitation.lastReminderAt = new Date();

    return this.invitationRepository.save(invitation);
  }

  async remove(id: string): Promise<void> {
    const result = await this.invitationRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Invitation with ID ${id} not found`);
    }
  }
}
