import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'auth.getHealth',
  LOGIN = 'auth.login',
  LOGIN_WEBAUTHN = 'auth.loginWebAuthn',
  LOGIN_WEBAUTHN_VERIFY = 'auth.loginWebAuthnVerify',
  GET_SESSION = 'auth.getSession',
  GET_SESSIONS = 'auth.getSessions',
  LOGOUT = 'auth.logout',
  LOGOUT_SESSIONS = 'auth.logoutSessions',
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  async getHealth() {
    try {
      this.logger.debug('Sending health check to auth service');

      const { status, message } = await firstValueFrom(
        this.authServiceClient
          .send<{ status: 'ok' | 'unhealthy'; message: string }>(
            MESSAGE_PATTERNS.GET_HEALTH,
            {},
          )
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received health check from auth service',
        status,
        message,
      );

      return {
        name: 'auth',
        status,
        message,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        name: 'auth',
        status: 'unhealthy',
        reason: error.message,
      };
    }
  }
}
