import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseRepository } from './repositories/response.repository';
import { CreateResponseDto } from './types/dtos/create-response.dto';
import { UpdateResponseDto } from './types/dtos/update-response.dto';
import { Response } from './entities/response.entity';

@Injectable()
export class ResponsesService {
  constructor(private responseRepository: ResponseRepository) {}

  async findAll(): Promise<Response[]> {
    return this.responseRepository.find({
      relations: ['question', 'user'],
    });
  }

  async findOne(id: string): Promise<Response> {
    const response = await this.responseRepository.findOne({
      where: { id },
      relations: ['question', 'user'],
    });

    if (!response) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }

    return response;
  }

  async findByQuestion(questionId: string): Promise<Response[]> {
    // Correction : Utiliser la notation avec la relation directe
    return this.responseRepository.find({
      where: { question: questionId },
      relations: ['user'],
    });
  }

  async findByUser(userId: string): Promise<Response[]> {
    // Correction : Utiliser la notation avec la relation directe
    return this.responseRepository.find({
      where: { user: userId },
      relations: ['question'],
    });
  }

  async create(createResponseDto: CreateResponseDto): Promise<Response> {
    const response = this.responseRepository.create(createResponseDto);
    return this.responseRepository.save(response);
  }

  async update(
    id: string,
    updateResponseDto: UpdateResponseDto,
  ): Promise<Response> {
    const response = await this.findOne(id);
    const updatedResponse = Object.assign(response, updateResponseDto);
    return this.responseRepository.save(updatedResponse);
  }

  async remove(id: string): Promise<void> {
    const response = await this.findOne(id);
    await this.responseRepository.remove(response);
  }
}
