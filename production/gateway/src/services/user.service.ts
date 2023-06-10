import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  CreateUserDto,
  CreateUserResponseDto,
} from 'src/interfaces/user.interface';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'user.getHealth',
}

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  async getHealth() {
    try {
      this.logger.debug('Sending health check to user service');

      const { status, message } = await firstValueFrom(
        this.userServiceClient
          .send<{ status: 'ok' | 'unhealthy'; message: string }>(
            MESSAGE_PATTERNS.GET_HEALTH,
            {},
          )
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received health check from user service',
        status,
        message,
      );

      return {
        name: 'user',
        status,
        message,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        name: 'user',
        status: 'unhealthy',
        reason: error.message,
      };
    }
  }

  async getUser(id: string) {
    return {};
  }

  async getUsers() {
    return {};
  }

  async getLoggedUser() {
    return {};
  }

  async createUser(userPayload: CreateUserDto): Promise<CreateUserResponseDto> {
    try {
      const user = await firstValueFrom(
        this.userServiceClient
          .send<CreateUserResponseDto>('user.createUser', userPayload)
          .pipe(timeout(5000)),
      );

      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async updateUser() {
    return {};
  }

  async removeUser() {
    return {};
  }
}
