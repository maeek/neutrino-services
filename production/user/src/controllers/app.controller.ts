import {
  Body,
  Controller,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from '../services/app.service';
import { CreateUserRequestDto } from 'src/interfaces/create-user.interface';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'user.getHealth',
  CREATE_USER = 'user.createUser',
  GET_USER = 'user.getUser',
  GET_USER_WITH_PASSWORD = 'user.getUserWithPassword',
  GET_USERS = 'user.getUsers',
  GET_LOGGED_USER = 'user.getLoggedUser',
  REMOVE_USER = 'user.removeUser',
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MESSAGE_PATTERNS.GET_HEALTH)
  getHealth() {
    return this.appService.getHealth();
  }

  @MessagePattern(MESSAGE_PATTERNS.CREATE_USER)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      enableDebugMessages: true,
    }),
  )
  async createUser(@Body() body: CreateUserRequestDto) {
    try {
      const user = await this.appService.createUser(body);

      return user;
    } catch (error) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        error: error.message,
      };
    }
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

  @MessagePattern(MESSAGE_PATTERNS.REMOVE_USER)
  async removeUser(@Body() body: { id: string }) {
    return this.appService.removeUser(body.id);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_USER_WITH_PASSWORD)
  async getUserWithPassword(@Body() body: any) {
    return this.appService.getUserWithPassword(body.username, body.password);
  }
}
