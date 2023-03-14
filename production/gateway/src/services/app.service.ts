import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHealth() {
    return {
      name: 'gateway',
      status: 'ok',
    };
  }
}
