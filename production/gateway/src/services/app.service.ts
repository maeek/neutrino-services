import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly logger: Logger) {}

  async getHealth() {
    this.logger.debug('Gateway health check');

    return {
      name: 'gateway',
      status: 'ok',
    };
  }
}
