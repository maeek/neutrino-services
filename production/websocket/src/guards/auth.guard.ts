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

      if (!client.data?.user?.verified || client.data?.user?.locked) {
        throw new Error('User not verified');
      }

      return true;
    } catch (e) {
      console.error('WsAuthGuard authentication failed', e);
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
