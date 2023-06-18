import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';
import { ChannelsMgmtService } from './channels-mgmt.service';

// https://github.com/nestjs/nest/issues/882#issuecomment-1493106283
@Injectable()
export class WsAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly channelsService: ChannelsMgmtService,
  ) {}

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
      const refreshToken = this.parseCookies(socket.handshake?.headers?.cookie)[
        'chat-session'
      ];

      if (!accessToken || !refreshToken) {
        throw new Error('No auth data');
      }

      const session = await this.authService.checkSessionAndRefresh(
        refreshToken.split(';')[0],
        accessToken,
      );

      socket.data.user = {
        id: session.user.id,
        verified: session.verified,
        locked: !!session.user.locked,
        sessionId: session.refreshToken?.id,
        role: session.user.role,
        username: session.user.username,
        mutedUsers: session.user?.settings?.mutedUsers,
        mutedChannels: session.user?.settings?.mutedChannels
          ?.filter((c) => c.muted)
          .map((c) => c.channel),
      };

      socket.join(`u/${socket.data.user.username}`);
      socket.join('global');

      const channelsThatUserIsIn = await this.channelsService.getGroupsWithUser(
        socket.data.user.id,
      );

      channelsThatUserIsIn.forEach((channel) => {
        socket.join(`c/${channel.name}`);
      });
    } catch (e) {
      await socket.disconnect();
    } finally {
      this.initializationMap.delete(socket.id);
      return socket;
    }
  }

  parseCookies(cookie: string) {
    return cookie.split(';').reduce((res, item) => {
      const data = item.trim().split('=');
      return { ...res, [data[0]]: data[1] };
    }, {});
  }
}
