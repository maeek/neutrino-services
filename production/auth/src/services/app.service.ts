import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return { status: 'ok' };
  }

  login() {
    return {};
  }

  loginWebAuthn() {
    return {};
  }

  loginWebAuthnVerify() {
    return {};
  }

  getSession() {
    return {};
  }

  getSessions() {
    return {};
  }

  logout() {
    return {};
  }

  logoutSessions() {
    return {};
  }
}
