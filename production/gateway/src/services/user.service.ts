import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { StandardErrorResponse } from 'src/interfaces/error.interface';
import {
  CreateUserDto,
  CreateUserResponseDto,
} from 'src/interfaces/user.interface';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'user.getHealth',
  CREATE_USER = 'user.createUser',
  GET_USER = 'user.getUser',
  UPDATE_USER = 'user.updateUser',
  GET_USERS = 'user.getUsers',
  GET_LOGGED_USER = 'user.getLoggedUser',
  REMOVE_USER = 'user.removeUser',
  SET_SESSION_TO_USER = 'user.setSessionToUser',
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
    try {
      const user = await firstValueFrom(
        this.userServiceClient
          .send(MESSAGE_PATTERNS.GET_USER, {
            id,
          })
          .pipe(timeout(5000)),
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.NOT_FOUND,
        error: error.message,
      };
    }
  }

  async getUsers(offset = 0, limit = 10, find?: string) {
    try {
      const users = await firstValueFrom(
        this.userServiceClient
          .send(MESSAGE_PATTERNS.GET_USERS, {
            offset,
            limit,
            find,
          })
          .pipe(timeout(5000)),
      );

      return users;
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.NOT_FOUND,
        error: error.message,
      };
    }
  }

  async createUser(
    userPayload: CreateUserDto,
  ): Promise<CreateUserResponseDto | StandardErrorResponse> {
    try {
      const user = await firstValueFrom(
        this.userServiceClient
          .send<CreateUserResponseDto>('user.createUser', userPayload)
          .pipe(timeout(5000)),
      );

      return user;
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.FORBIDDEN,
        error: error.message,
      };
    }
  }

  async updateUser(
    username: string,
    userPayload: { description?: string; avatar?: File },
  ) {
    try {
      const user = await firstValueFrom(
        this.userServiceClient
          .send(MESSAGE_PATTERNS.UPDATE_USER, {
            username,
            userPayload,
          })
          .pipe(timeout(5000)),
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.FORBIDDEN,
        error: error.message,
      };
    }
  }

  async removeUser(id: string) {
    try {
      const user = await firstValueFrom(
        this.userServiceClient
          .send(MESSAGE_PATTERNS.REMOVE_USER, {
            id,
          })
          .pipe(timeout(5000)),
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.NOT_FOUND,
        error: error.message,
      };
    }
  }
}
