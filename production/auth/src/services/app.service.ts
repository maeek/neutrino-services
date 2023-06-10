import { Injectable, Logger } from '@nestjs/common';
import { TokensRepository } from './token.repository';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: Logger,
    private readonly tokenRepository: TokensRepository,
  ) {}

  async getHealth() {
    return { status: 'ok' };
  }

  async login() {
    return {};
  }

  async loginWebAuthn() {
    return {};
  }

  async loginWebAuthnVerify() {
    return {};
  }

  async getSession(refreshToken: string) {
    try {
      const token = await this.tokenRepository.findOne({ refreshToken });
      return token;
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
