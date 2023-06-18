import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { defaultIfEmpty, firstValueFrom, timeout } from 'rxjs';

enum MESSAGE_PATTERNS {
  MUTE_USERS = 'websocket.muteUsers',
}

@Injectable()
export class WebsocketService {
  constructor(
    @Inject('WEBSOCKET_SERVICE')
    private readonly websocketClient: ClientProxy,
  ) {}

  async muteUsers(username: string, users: string[]) {
    const result = await firstValueFrom(
      this.websocketClient
        .send(MESSAGE_PATTERNS.MUTE_USERS, {
          username,
          users,
        })
        .pipe(timeout(5000), defaultIfEmpty([])),
    );

    return result;
  }
}
