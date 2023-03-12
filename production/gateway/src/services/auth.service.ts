import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'auth.getHealth',
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  async getHealth() {
    try {
      const { status } = await firstValueFrom(
        this.authServiceClient.send<{ status: 'ok' }>(
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
