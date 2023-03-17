import { Controller, Get } from '@nestjs/common';
import { WebsocketService } from '../services/websocket.service';

@Controller('websocket')
export class WebsocketController {
  constructor(private readonly websocketService: WebsocketService) {}

  @Get('/health')
  async getHealth() {
    return this.websocketService.getHealth();
  }
}
