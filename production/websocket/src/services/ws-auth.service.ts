import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';

// https://github.com/nestjs/nest/issues/882#issuecomment-1493106283
@Injectable()
export class WsAuthService {
  constructor(private readonly authService: AuthService) {}

  private initializationMap = new Map<string, Promise<any>>();

  onClientConnect(socket: Socket) {
    this.initializationMap.set(socket.id, this.initialize(socket));
  }

  async finishInitialization(socket: Socket): Promise<any> {
    await this.initializationMap.get(socket.id);
  }

  private async initialize(socket: Socket): Promise<any> {
    try {
      const accessToken =
        socket.handshake?.headers?.authorization?.split(' ')[1];
      const refreshToken = socket.handshake?.headers?.cookie?.split('=')[1];

      if (!accessToken || !refreshToken) {
        throw new Error('No auth data');
      }

      const session = await this.authService.checkSessionAndRefresh(
        refreshToken,
        accessToken,
      );

      socket.data.user = {
        verified: session.verified,
        locked: !!session.user.locked,
        sessionId: session.refreshToken?.id,
        role: session.user.role,
        username: session.user.username,
        mutedUsers: session.user?.mutedUsers,
        mutedChannels: session.user?.mutedChannels
          ?.filter((c) => c.muted)
          .map((c) => c.channel),
      };
    } catch (e) {
      socket.disconnect();
    } finally {
      this.initializationMap.delete(socket.id);
    }
  }
}