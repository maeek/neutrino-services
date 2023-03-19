import { Controller, Get, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from '../services/app.service';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'websocket.getHealth',
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MESSAGE_PATTERNS.GET_HEALTH)
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('/health')
  getHealthHttp() {
    return this.appService.getHealth();
  }

  @Post('/message/all')
  async messageToAll() {
    await this.appService.sendToAll('message', 'Hello from websocket');
  }
}
