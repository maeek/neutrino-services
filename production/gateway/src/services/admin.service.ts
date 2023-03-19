import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'admin.getHealth',
}

@Injectable()
export class AdminService {
  constructor(
    @Inject('ADMIN_SERVICE')
    private readonly adminServiceClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  async getHealth() {
    try {
      this.logger.debug('Sending health check to admin service');

      const { status, message } = await firstValueFrom(
        this.adminServiceClient
          .send<{ status: 'ok' | 'unhealthy'; message: string }>(
            MESSAGE_PATTERNS.GET_HEALTH,
            {},
          )
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received health check from admin service',
        status,
        message,
      );

      return {
        name: 'admin',
        status,
        message,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        name: 'admin',
        status: 'unhealthy',
        reason: error.message,
      };
    }
  }
}
