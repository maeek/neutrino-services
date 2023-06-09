import { Controller, Delete, Get, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/health')
  @ApiTags('Health')
  async getHealth() {
    return this.authService.getHealth();
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  @ApiTags('Authentication')
  async login() {
    return {};
  }

  @Post('/login/challenge')
  @ApiOperation({ summary: 'Login with WebAuthn' })
  @ApiTags('Authentication')
  async loginChallenge() {
    return {};
  }

  @Post('/login/challenge-verify')
  @ApiOperation({ summary: 'Login with WebAuthn' })
  @ApiTags('Authentication')
  async loginChallengeVerify() {
    return {};
  }

  @Delete('/session')
  @ApiOperation({ summary: 'Logout' })
  @ApiTags('Authentication')
  async logout() {
    return {};
  }

  @Delete('/sessions')
  @ApiOperation({ summary: 'Logout active sessions by Id' })
  @ApiTags('Authentication')
  async logoutById() {
    return {};
  }

  @Get('/sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiTags('Authentication')
  async getActiveSessions() {
    return {};
  }
}
