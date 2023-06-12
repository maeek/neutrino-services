import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsAuthService } from '../services/ws-auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly wsAuthService: WsAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();

      await this.wsAuthService.finishInitialization(client);

      return !client.data.user.locked && client.data.user.verfied;
    } catch (e) {
      return false;
    }
  }

  extractJwtFromHeaders(headers: any) {
    const authHeader = headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
  }
}
