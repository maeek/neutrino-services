import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { UsersResponseDto } from 'src/interfaces/auth.interface';

enum MESSAGE_PATTERNS {
  GET_SESSION_AND_RENEW = 'auth.getSessionAndRenew',
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  async checkSessionAndRefresh(refreshToken: string, accessToken: string) {
    try {
      this.logger.debug('Sending check session request to auth service');

      const session = await firstValueFrom(
        this.authServiceClient
          .send<{
            user: UsersResponseDto;
            verified: boolean;
            refreshToken: {
              refreshToken: string;
              id: string;
            };
            accessToken: string;
          }>(MESSAGE_PATTERNS.GET_SESSION_AND_RENEW, {
            refreshToken,
            accessToken,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received check session response from auth service');

      return session;
    } catch (error) {
      this.logger.error(error);
      return {
        verified: false,
        user: null,
        refreshToken: null,
      };
    }
  }
}
