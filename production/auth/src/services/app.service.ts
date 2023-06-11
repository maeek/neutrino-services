import { Inject, Injectable, Logger } from '@nestjs/common';
import { TokensRepository } from './token.repository';
import { WebAuthnRequestDto } from 'src/interfaces/login.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { TokenSigningService } from './jwt.service';

enum USER_MESSAGE_PATTERNS {
  GET_USER = 'user.getUser',
  GET_USER_WITH_PASSWORD = 'user.getUserWithPassword',
}

@Injectable()
export class AppService {
  constructor(
    private readonly logger: Logger,
    private readonly tokenRepository: TokensRepository,
    private readonly jwtService: TokenSigningService,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
  ) {}

  async getHealth() {
    return { status: 'ok' };
  }

  async login(
    username: string,
    method: 'password' | 'webauthn',
    passwordOrWebAuthn: string | WebAuthnRequestDto,
  ) {
    if (method === 'password') {
      return this.loginPassword(username, passwordOrWebAuthn as string);
    } else if (method === 'webauthn') {
      return this.loginWebAuthn(
        username,
        passwordOrWebAuthn as WebAuthnRequestDto,
      );
    }

    throw new Error('Invalid login method');
  }

  async loginPassword(username: string, password: string) {
    const user = await firstValueFrom(
      this.userServiceClient
        .send(USER_MESSAGE_PATTERNS.GET_USER_WITH_PASSWORD, {
          username,
          password,
        })
        .pipe(timeout(5000)),
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const refreshToken = await this.jwtService.createRefreshToken();
    const savedToken = await this.tokenRepository.create({
      username,
      refreshToken,
    });
    const accessToken = await this.jwtService.createAccessToken(
      username,
      user.role,
      savedToken.id,
    );

    return {
      loggedIn: true,
      refreshToken,
      accessToken,
      user,
    };
  }

  async loginWebAuthn(username: string, webAuthnRequest: WebAuthnRequestDto) {
    return {};
  }

  async loginWebAuthnVerify() {
    return {};
  }

  async getSessionAndRenew(refreshToken: string) {
    try {
      const token = await this.tokenRepository.findOne({ refreshToken });
      const user = await firstValueFrom(
        this.userServiceClient
          .send<{
            username: string;
            role: string;
          }>(USER_MESSAGE_PATTERNS.GET_USER, {
            id: token.username,
          })
          .pipe(timeout(5000)),
      );

      if (!token || !user) {
        throw new Error('Invalid session');
      }

      const newAccessToken = await this.jwtService.createAccessToken(
        user.username,
        user.role,
        token.id,
      );

      return {
        verified: true,
        refreshToken: token,
        accessToken: newAccessToken,
        user,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        verified: false,
      };
    }
  }

  async getSessions(username: string) {
    try {
      const tokens = await this.tokenRepository.find({ username });
      return tokens;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.tokenRepository.remove({ refreshToken });
      // await this.messageService.logout(username, [refreshToken])
      return {};
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async logoutSessions(username: string, sessions: string[]) {
    try {
      await this.tokenRepository.remove({
        username,
        refreshToken: {
          $in: sessions,
        },
      });
      // await this.messageService.logout(username, sessions)
      return {};
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async createWebAuthnOptions() {
    return {};
  }

  async getChallenge() {
    return {};
  }

  async solveChallenge() {
    return {};
  }
}
