import { Controller, Get } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('message')
@ApiTags('Health')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/health')
  async getHealth() {
    return this.messageService.getHealth();
  }
}
