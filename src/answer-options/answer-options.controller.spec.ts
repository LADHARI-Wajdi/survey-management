import { Test, TestingModule } from '@nestjs/testing';
import { AnswerOptionsController } from './answer-options.controller';

describe('AnswerOptionsController', () => {
  let controller: AnswerOptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerOptionsController],
    }).compile();

    controller = module.get<AnswerOptionsController>(AnswerOptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
