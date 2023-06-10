import { Body, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from '../services/app.service';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'admin.getHealth',
  GET_CONFIG = 'admin.getConfig',
  SET_CONFIG = 'admin.setConfig',
  GET_AUDIT_LOGS = 'admin.getAuditLogs',
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MESSAGE_PATTERNS.GET_HEALTH)
  getHealth() {
    return this.appService.getHealth();
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_CONFIG)
  getConfig() {
    return this.appService.getConfig();
  }

  @MessagePattern(MESSAGE_PATTERNS.SET_CONFIG)
  setConfig(@Body() config: any) {
    return this.appService.setConfig(config);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_AUDIT_LOGS)
  getAuditLogs() {
    return this.appService.getAuditLogs();
  }
}
