import { Body, Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from '../services/app.service';
import { LoginRequestDto } from 'src/interfaces/login.interface';
import { LogoutRequestDto } from 'src/interfaces/logout.interface';
import { GetSessionAndRenewRequestDto } from 'src/interfaces/get-session.interface';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'auth.getHealth',
  LOGIN = 'auth.login',
  LOGIN_WEBAUTHN = 'auth.loginWebAuthn',
  LOGIN_WEBAUTHN_VERIFY = 'auth.loginWebAuthnVerify',
  CREATE_WEBAUTHN_OPTIONS = 'auth.createWebAuthnOptions',
  GET_CHALLENGE = 'auth.getChallenge',
  SOLVE_CHALLENGE = 'auth.solveChallenge',
  GET_SESSION = 'auth.getSession',
  GET_SESSION_AND_RENEW = 'auth.getSessionAndRenew',
  GET_SESSIONS = 'auth.getSessions',
  LOGOUT = 'auth.logout',
  LOGOUT_SESSIONS = 'auth.logoutSessions',
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MESSAGE_PATTERNS.GET_HEALTH)
  async getHealth() {
    return this.appService.getHealth();
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() body: LoginRequestDto) {
    try {
      const loggedIn = await this.appService.login(
        body.username,
        body.method,
        body.method === 'password' ? body.password : body.webauthn,
      );

      return loggedIn;
    } catch (error) {
      console.error(error);
      return {
        loggedIn: false,
      };
    }
  }

  // @MessagePattern(MESSAGE_PATTERNS.LOGIN_WEBAUTHN)
  // async loginWebAuthn() {
  //   return this.appService.loginWebAuthn();
  // }

  @MessagePattern(MESSAGE_PATTERNS.LOGIN_WEBAUTHN_VERIFY)
  async loginWebAuthnVerify() {
    return this.appService.loginWebAuthnVerify();
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_SESSION_AND_RENEW)
  async getSession(@Body() body: GetSessionAndRenewRequestDto) {
    return this.appService.getSessionAndRenew(body.refreshToken);
  }

  // @MessagePattern(MESSAGE_PATTERNS.GET_SESSIONS)
  // async getSessions() {
  //   return this.appService.getSessions('');
  // }

  @MessagePattern(MESSAGE_PATTERNS.LOGOUT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async logout(@Body() body: LogoutRequestDto) {
    return this.appService.logout(body.username, body.sessionId);
  }

  // @MessagePattern(MESSAGE_PATTERNS.LOGOUT_SESSIONS)
  // async logoutSessions() {
  //   return this.appService.logoutSessions('', []);
  // }

  // @MessagePattern(MESSAGE_PATTERNS.CREATE_WEBAUTHN_OPTIONS)
  // async createWebAuthnOptions() {
  //   return this.appService.createWebAuthnOptions();
  // }

  // @MessagePattern(MESSAGE_PATTERNS.GET_CHALLENGE)
  // async getChallenge() {
  //   return this.appService.getChallenge();
  // }

  // @MessagePattern(MESSAGE_PATTERNS.SOLVE_CHALLENGE)
  // async solveChallenge() {
  //   return this.appService.solveChallenge();
  // }
}
