import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from '../interfaces/auth.interface';
import { UserService } from '../services/user.service';
import { Response } from 'express';
import { isError } from '../interfaces/error.interface';
import { SelfUserResponseDto } from '../interfaces/user.interface';
import { instanceToPlain } from 'class-transformer';
import { AuthGuard } from 'src/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('/health')
  @ApiTags('Health')
  async getHealth() {
    return this.authService.getHealth();
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginRequestDto })
  @ApiTags('Authentication')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async login(@Body() body: LoginRequestDto, @Res() res: Response) {
    try {
      const user = await this.userService.getUser(body.username);
      const loginData = await this.authService.login(body, user);

      if (isError(loginData)) {
        throw new Error(loginData.error);
      }

      res.cookie('chat-session', loginData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.COOKIE_DOMAIN,
      });
      res.setHeader('x-api-token', `Bearer ${loginData.accessToken}`);

      res.json({
        me: instanceToPlain(new SelfUserResponseDto(user)),
      });
      res.end();
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }
  }

  // @Post('/login/challenge')
  // @ApiOperation({ summary: 'Login with WebAuthn' })
  // @ApiTags('Authentication')
  // async loginChallenge() {
  //   return {};
  // }

  // @Post('/login/challenge-verify')
  // @ApiOperation({ summary: 'Login with WebAuthn' })
  // @ApiTags('Authentication')
  // async loginChallengeVerify() {
  //   return {};
  // }

  @Delete('/session')
  @ApiOperation({ summary: 'Logout' })
  @ApiTags('Authentication')
  @UseGuards(AuthGuard)
  async logout(@Req() req: any, @Res() res: Response) {
    try {
      const refreshToken = req.refreshToken.id;
      const username = req.user.username;

      await this.authService.logout(username, refreshToken);

      res.clearCookie('chat-session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.COOKIE_DOMAIN,
      });

      res.status(HttpStatus.NO_CONTENT).end();
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid session',
      });
    }
  }

  @Delete('/sessions')
  @ApiOperation({ summary: 'Logout active sessions by Id' })
  @ApiTags('Authentication')
  @UseGuards(AuthGuard)
  async logoutById() {
    return {};
  }

  @Get('/sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiTags('Authentication')
  @UseGuards(AuthGuard)
  async getActiveSessions() {
    return {};
  }
}
