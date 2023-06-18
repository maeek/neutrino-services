import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { defaultIfEmpty, firstValueFrom, timeout } from 'rxjs';

enum MESSAGE_PATTERNS {
  CLOSE_SESSIONS = 'websocket.closeSessions',
}

@Injectable()
export class WebsocketService {
  constructor(
    @Inject('WEBSOCKET_SERVICE')
    private readonly websocketClient: ClientProxy,
  ) {}

  async closeSessions(user: string, sessionId?: string) {
    try {
      await firstValueFrom(
        this.websocketClient
          .send(MESSAGE_PATTERNS.CLOSE_SESSIONS, {
            users: [{ id: user, sessionId }],
          })
          .pipe(defaultIfEmpty({}), timeout(5000)),
      );

      return true;
    } catch (error) {
      console.error(error);
    }
  }
}
