import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'admin.getHealth',
}

@Injectable()
export class AdminService {
  constructor(
    @Inject('ADMIN_SERVICE')
    private readonly adminServiceClient: ClientProxy,
  ) {}

  async getHealth() {
    try {
      const { status } = await firstValueFrom(
        this.adminServiceClient.send<{ status: 'ok' }>(
          MESSAGE_PATTERNS.GET_HEALTH,
          {},
        ),
      );

      return {
        status,
      };
    } catch (error) {
      console.error(error);
      return {
        status: 'down',
      };
    }
  }
}
