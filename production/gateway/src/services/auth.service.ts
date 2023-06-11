import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  LoginRequestDto,
  LoginResponseDto,
  SessionResponse,
} from '../interfaces/auth.interface';
import { UsersResponseDto } from '../interfaces/user.interface';
import { StandardErrorResponse } from 'src/interfaces/error.interface';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'auth.getHealth',
  LOGIN = 'auth.login',
  LOGIN_WEBAUTHN = 'auth.loginWebAuthn',
  LOGIN_WEBAUTHN_VERIFY = 'auth.loginWebAuthnVerify',
  GET_SESSION_AND_RENEW = 'auth.getSessionAndRenew',
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

  async login(
    body: LoginRequestDto,
    user: UsersResponseDto,
  ): Promise<LoginResponseDto | StandardErrorResponse> {
    try {
      this.logger.debug('Sending login request to auth service');

      const loggedIn = await firstValueFrom(
        this.authServiceClient
          .send<LoginResponseDto>(MESSAGE_PATTERNS.LOGIN, {
            ...body,
            user,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received login response from auth service',
        loggedIn.user.username,
      );

      return loggedIn;
    } catch (error) {
      this.logger.error(error);
      return {
        error: error.message,
        statusCode: HttpStatus.UNAUTHORIZED,
      };
    }
  }

  async logout(username: string, sessions: string[]): Promise<void> {
    try {
      this.logger.debug('Sending logout request to auth service');

      await firstValueFrom(
        this.authServiceClient
          .send<void>(MESSAGE_PATTERNS.LOGOUT, {
            username,
            sessions,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received logout response from auth service');
    } catch (error) {
      this.logger.error(error);
    }
  }

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
      return false;
    }
  }

  async getActiveSessions(username: string) {
    try {
      this.logger.debug('Sending get sessions request to auth service');

      const sessions = await firstValueFrom(
        this.authServiceClient
          .send<SessionResponse[]>(MESSAGE_PATTERNS.GET_SESSIONS, {
            username,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received get sessions response from auth service');

      return sessions;
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }
}
