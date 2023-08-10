import { Test, TestingModule } from '@nestjs/testing';
import { DialogsGateway } from './dialogs.gateway';
import { DialogsService } from './dialogs.service';

describe('DialogsGateway', () => {
  let gateway: DialogsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DialogsGateway, DialogsService],
    }).compile();

    gateway = module.get<DialogsGateway>(DialogsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
