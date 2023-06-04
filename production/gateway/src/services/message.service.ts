import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'websocket.getHealth',
}

@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGE_SERVICE')
    private readonly adminServiceClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  async getHealth() {
    try {
      this.logger.debug('Sending health check to websocket service');

      const { status, message } = await firstValueFrom(
        this.adminServiceClient
          .send<{ status: 'ok' | 'unhealthy'; message: string }>(
            MESSAGE_PATTERNS.GET_HEALTH,
            {},
          )
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received health check from websocket service',
        status,
        message,
      );

      return {
        name: 'websocket',
        status,
        message,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        name: 'websocket',
        status: 'unhealthy',
        reason: error.message,
      };
    }
  }
}
