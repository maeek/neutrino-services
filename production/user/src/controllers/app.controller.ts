import { Body, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from '../services/app.service';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'user.getHealth',
  CREATE_USER = 'user.createUser',
  GET_USER = 'user.getUser',
  GET_USERS = 'user.getUsers',
  GET_LOGGED_USER = 'user.getLoggedUser',
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MESSAGE_PATTERNS.GET_HEALTH)
  getHealth() {
    return this.appService.getHealth();
  }

  @MessagePattern(MESSAGE_PATTERNS.CREATE_USER)
  createUser() {
    return this.appService.createUser();
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_USERS)
  async getUsers(@Body() body: any) {
    return this.appService.getUsers(body.offset, body.limit, body.find);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_USER)
  async getUser(@Body() body: any) {
    return this.appService.getUser(body.id);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_LOGGED_USER)
  async getLoggedUser(@Body() body: any) {
    return this.appService.getLoggedUser(body.token);
  }
}
