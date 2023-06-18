import {
  Body,
  Controller,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from '../services/app.service';
import { LoginRequestDto } from 'src/interfaces/login.interface';
import { LogoutRequestDto } from 'src/interfaces/logout.interface';
import { GetSessionAndRenewRequestDto } from 'src/interfaces/get-session.interface';
import { GetSessionsRequestDto } from 'src/interfaces/get-sessions.interface';
import { WebAuthnService } from 'src/services/webauthn.service';
import { Request } from 'express';

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
  LOGOUT_ALL_SESSIONS = 'auth.logoutAllSessions',
  WEBAUTHN_GEN_REG_OPTS = 'auth.loginWebAuthnGenRegOpts',
  WEBAUTH_VERIFY_REG = 'auth.loginWebAuthnVerifyReg',
  CREATE_SESSION = 'auth.createSession',
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly webauthnService: WebAuthnService,
  ) {}

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
        body.device,
      );

      return loggedIn;
    } catch (error) {
      console.error(error);
      return {
        loggedIn: false,
      };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGIN_WEBAUTHN)
  async loginWebAuthn(@Body() body: LoginRequestDto) {
    return this.webauthnService.generateAuthenticationOptions(body.username);
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGIN_WEBAUTHN_VERIFY)
  async loginWebAuthnVerify(@Body() body: any) {
    return this.webauthnService.verifyAuth(body.username, body.webauthn);
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_SESSION_AND_RENEW)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getSession(@Body() body: GetSessionAndRenewRequestDto) {
    if (!body.refreshToken && !body.accessToken) {
      return {
        error: 'No refresh token or access token provided',
      };
    }

    return this.appService.getSessionAndRenew(
      body.refreshToken,
      body.accessToken,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_SESSIONS)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getSessions(@Body() body: GetSessionsRequestDto) {
    const sessions = await this.appService.getSessions(body.username);

    return sessions.map((ses) => ({
      ...ses.toJSON(),
      // decode base64 json and parse
      device: JSON.parse(
        Buffer.from(ses.refreshToken.split('.')[1], 'base64').toString('utf-8'),
      ).device,
    }));
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGOUT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async logout(@Body() body: LogoutRequestDto) {
    return this.appService.logout(body.username, body.sessions);
  }

  @MessagePattern(MESSAGE_PATTERNS.LOGOUT_ALL_SESSIONS)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async logoutAllSessions(@Body() body: LogoutRequestDto) {
    return this.appService.logoutAllSession(body.username);
  }

  @MessagePattern(MESSAGE_PATTERNS.WEBAUTHN_GEN_REG_OPTS)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async webAuthnGenRegOpts(@Body() body: LogoutRequestDto) {
    return this.webauthnService.generateRegistrationOptions(body.username);
  }

  @MessagePattern(MESSAGE_PATTERNS.WEBAUTH_VERIFY_REG)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async webAuthnVerifyReg(@Body() body: any) {
    return this.webauthnService.verifyRegistration(
      body.username,
      body.webauthn,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.CREATE_SESSION)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createSession(@Body() body: any) {
    return this.appService.createSession(body.user, body.device);
  }
}
