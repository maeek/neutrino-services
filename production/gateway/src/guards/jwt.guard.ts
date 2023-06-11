import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const accessToken = this.extractJwtFromHeaders(request.headers);
    const refreshToken = request.cookies?.['chat-session'];

    if (!accessToken || !refreshToken) {
      return false;
    }

    const jwtRes = await this.authService.checkSessionAndRefresh(refreshToken);

    if (!jwtRes) {
      response.clearCookie('chat-session');
      return false;
    }

    request.user = jwtRes.user;
    request.accessToken = jwtRes.accessToken;
    request.refreshToken = jwtRes.refreshToken;

    response.setHeader('x-api-token', `Bearer ${jwtRes.accessToken}`);

    return true;
  }

  extractJwtFromHeaders(headers: any) {
    const authHeader = headers['authorization'];
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
  }
}
