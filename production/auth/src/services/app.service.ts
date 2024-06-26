import { Inject, Injectable, Logger } from '@nestjs/common';
import { TokensRepository } from './token.repository';
import { WebAuthnRequestDto } from 'src/interfaces/login.interface';
import { ClientProxy } from '@nestjs/microservices';
import { defaultIfEmpty, firstValueFrom, timeout } from 'rxjs';
import { TokenSigningService } from './jwt.service';
import { WebsocketService } from './websocket.service';

enum USER_MESSAGE_PATTERNS {
  GET_USER = 'user.getUser',
  GET_USER_WITH_PASSWORD = 'user.getUserWithPassword',
  SET_SESSION_TO_USER = 'user.setSessionToUser',
  REMOVE_SESSION_FROM_USER = 'user.removeSessionFromUser',
}

@Injectable()
export class AppService {
  constructor(
    private readonly logger: Logger,
    private readonly tokenRepository: TokensRepository,
    private readonly jwtService: TokenSigningService,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
    private readonly websocketService: WebsocketService,
  ) {}

  async getHealth() {
    return { status: 'ok' };
  }

  async login(
    username: string,
    method: 'password' | 'webauthn',
    passwordOrWebAuthn: string | WebAuthnRequestDto,
    device: string,
  ) {
    if (method === 'password') {
      return this.loginPassword(username, passwordOrWebAuthn as string, device);
    }

    throw new Error('Invalid login method');
  }

  async loginPassword(username: string, password: string, device: string) {
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

    const refreshToken = await this.jwtService.createRefreshToken(device);
    const savedToken = await this.tokenRepository.create({
      username,
      refreshToken,
    });
    const accessToken = await this.jwtService.createAccessToken(
      username,
      user.role,
      savedToken.id,
    );

    await firstValueFrom(
      this.userServiceClient
        .send(USER_MESSAGE_PATTERNS.SET_SESSION_TO_USER, {
          username,
          sessionId: savedToken.id,
        })
        .pipe(timeout(5000)),
    );

    return {
      loggedIn: true,
      refreshToken,
      accessToken,
      user: {
        ...user,
        sessions: [...user.sessions, savedToken.id],
      },
    };
  }

  async getSessionAndRenew(refreshToken: string, accessToken: string) {
    try {
      await this.jwtService.verifyRefreshToken(refreshToken);

      const token = await this.tokenRepository.findOne({ refreshToken });
      const user = await firstValueFrom(
        this.userServiceClient
          .send<{
            username: string;
            role: string;
            sessions: string[];
          }>(USER_MESSAGE_PATTERNS.GET_USER, {
            id: token?.username,
          })
          .pipe(timeout(5000)),
      );

      if (!token || !user || !user.username) {
        throw new Error('Invalid session');
      }

      let newAccessToken = accessToken;
      try {
        await this.jwtService.verifyAccessToken(newAccessToken);
      } catch {
        newAccessToken = await this.jwtService.createAccessToken(
          user.username,
          user.role,
          token.id,
        );
      }

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

  async createSession(user: any, device: string) {
    try {
      if (!user) {
        throw new Error('Invalid username or password');
      }

      const refreshToken = await this.jwtService.createRefreshToken(device);
      const savedToken = await this.tokenRepository.create({
        username: user.username,
        refreshToken,
      });
      const accessToken = await this.jwtService.createAccessToken(
        user.username,
        user.role,
        savedToken.id,
      );

      await firstValueFrom(
        this.userServiceClient
          .send(USER_MESSAGE_PATTERNS.SET_SESSION_TO_USER, {
            username: user.username,
            sessionId: savedToken.id,
          })
          .pipe(timeout(5000)),
      );

      return {
        loggedIn: true,
        refreshToken,
        accessToken,
        user: {
          ...user,
          sessions: [...user.sessions, savedToken.id],
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getSessions(username: string) {
    try {
      const tokens = await this.tokenRepository.find({ username });
      return tokens;
    } catch (error) {
      this.logger.error(error, error.stack);
      throw error;
    }
  }

  async logout(username: string, sessions: string[]) {
    try {
      await this.tokenRepository.remove({
        $and: [
          {
            username,
          },
          {
            _id: {
              $in: sessions,
            },
          },
        ],
      });
      await Promise.all(
        sessions.map((sessionId) => {
          this.websocketService.closeSessions(username, sessionId);
          return firstValueFrom(
            this.userServiceClient
              .send(USER_MESSAGE_PATTERNS.REMOVE_SESSION_FROM_USER, {
                username,
                sessionId,
              })
              .pipe(defaultIfEmpty({}), timeout(5000)),
          );
        }),
      );
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
      await Promise.all(
        sessions.map((sessionId) =>
          this.websocketService.closeSessions(username, sessionId),
        ),
      );
      return {};
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async logoutAllSession(username: string) {
    try {
      await this.tokenRepository.remove({
        username,
      });
      await this.websocketService.closeSessions(username);
      return {};
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
