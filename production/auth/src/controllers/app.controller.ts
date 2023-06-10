import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from '../services/app.service';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'auth.getHealth',
  LOGIN = 'auth.login',
  LOGIN_WEBAUTHN = 'auth.loginWebAuthn',
  LOGIN_WEBAUTHN_VERIFY = 'auth.loginWebAuthnVerify',
  CREATE_WEBAUTHN_OPTIONS = 'auth.createWebAuthnOptions',
  GET_CHALLENGE = 'auth.getChallenge',
  SOLVE_CHALLENGE = 'auth.solveChallenge',
  GET_SESSION = 'auth.getSession',
  GET_SESSIONS = 'auth.getSessions',
  LOGOUT = 'auth.logout',
  LOGOUT_SESSIONS = 'auth.logoutSessions',
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(MESSAGE_PATTERNS.GET_HEALTH)
  getHealth() {
    return this.appService.getHealth();
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGIN)
  login() {
    return this.appService.login();
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGIN_WEBAUTHN)
  loginWebAuthn() {
    return this.appService.loginWebAuthn();
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGIN_WEBAUTHN_VERIFY)
  loginWebAuthnVerify() {
    return this.appService.loginWebAuthnVerify();
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_SESSION)
  getSession() {
    return this.appService.getSession('');
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_SESSIONS)
  getSessions() {
    return this.appService.getSessions('');
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGOUT)
  logout() {
    return this.appService.logout('');
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGOUT_SESSIONS)
  logoutSessions() {
    return this.appService.logoutSessions('', []);
  }

  @MessagePattern(MESSAGE_PATTERNS.CREATE_WEBAUTHN_OPTIONS)
  createWebAuthnOptions() {
    return this.appService.createWebAuthnOptions();
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_CHALLENGE)
  getChallenge() {
    return this.appService.getChallenge();
  }

  @MessagePattern(MESSAGE_PATTERNS.SOLVE_CHALLENGE)
  solveChallenge() {
    return this.appService.solveChallenge();
  }
}
