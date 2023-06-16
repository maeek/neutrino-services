import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
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
import {
  DeleteSessionsRequestDto,
  LoginRequestDto,
  SessionResponse,
} from '../interfaces/auth.interface';
import { UserService } from '../services/user.service';
import { Response } from 'express';
import { isError } from '../interfaces/error.interface';
import {
  SelfUserResponseDto,
  UsersLoggedResponseDto,
  UsersLoggedSetttingsChannelResponseDto,
  UsersLoggedSetttingsResponseDto,
} from '../interfaces/user.interface';
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

  @Post('/webauthn/reg-options')
  @ApiOperation({ summary: 'WebAuthn registration options' })
  @ApiTags('Authentication')
  async webAuthnRegOptions(@Body() body: { username: string }) {
    const options = await this.authService.generateRegistrationOptions(
      body.username,
    );

    if (isError(options)) {
      throw new HttpException(options, HttpStatus.FORBIDDEN);
    }

    return options;
  }

  @Post('/webauthn/login-options')
  @ApiOperation({ summary: 'WebAuthn login options' })
  @ApiTags('Authentication')
  async webAuthnLoginOptions(@Body() body: { username: string }) {
    const options = await this.authService.generateLoginOptions(body.username);

    if (isError(options)) {
      throw new HttpException(options, HttpStatus.FORBIDDEN);
    }

    return options;
  }

  @Post('/login/webauthn')
  @ApiOperation({ summary: 'WebAuthn login options' })
  @ApiTags('Authentication')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async webAuthnLoginVerify(
    @Body() body: { username: string; webauthn: any },
    @Res() res: Response,
  ) {
    await this.authService.verifyLogin(body.username, body.webauthn);

    const user = await this.userService.getUser(body.username);
    const userSession = await this.authService.createSessionForUser(user);

    if (isError(userSession)) {
      throw new HttpException(userSession, HttpStatus.FORBIDDEN);
    }

    res.cookie('chat-session', userSession.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN,
    });
    res.setHeader('x-api-token', `Bearer ${userSession.accessToken}`);

    res.json({
      me: instanceToPlain(
        new UsersLoggedResponseDto({
          ...user,
          settings: new UsersLoggedSetttingsResponseDto({
            ...user?.settings,
            chats: user?.settings?.chats?.map(
              (channel) =>
                new UsersLoggedSetttingsChannelResponseDto({
                  ...channel,
                  lastMessage: null,
                }),
            ),
          }),
        }),
      ),
    });
    res.end();
  }

  @Post('/registration/webauthn')
  @ApiOperation({ summary: 'WebAuthn registration options' })
  @ApiTags('Authentication')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async webAuthnRegVerify(
    @Body() body: { username: string; webauthn: any },
    @Res() res: Response,
  ) {
    await this.authService.verifyRegistration(body.username, body.webauthn);

    const user = await this.userService.getUser(body.username);
    const userSession = await this.authService.createSessionForUser(user);

    if (isError(userSession)) {
      throw new HttpException(userSession, HttpStatus.FORBIDDEN);
    }

    res.cookie('chat-session', userSession.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN,
    });
    res.setHeader('x-api-token', `Bearer ${userSession.accessToken}`);

    res.json({
      me: instanceToPlain(
        new UsersLoggedResponseDto({
          ...user,
          settings: new UsersLoggedSetttingsResponseDto({
            ...user?.settings,
            chats: user?.settings?.chats?.map(
              (chat) => new UsersLoggedSetttingsChannelResponseDto(chat),
            ),
          }),
        }),
      ),
    });
    res.end();
  }

  @Post('/registration/')
  @ApiOperation({ summary: 'WebAuthn registration options' })
  @ApiTags('Authentication')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async register(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const user = await this.userService.getUser(body.username);

    if (!isError(user) && user.username) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Failed to register user',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const newUser = await this.userService.createUser({
      username: body.username,
      password: body.password,
      method: 'password',
    });

    if (isError(newUser)) {
      throw new HttpException(newUser, HttpStatus.FORBIDDEN);
    }

    const userSession = await this.authService.createSessionForUser(
      newUser as any,
    );

    if (isError(userSession)) {
      throw new HttpException(userSession, HttpStatus.FORBIDDEN);
    }

    res.cookie('chat-session', userSession.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN,
    });
    res.setHeader('x-api-token', `Bearer ${userSession.accessToken}`);

    res.json({
      me: instanceToPlain(
        new UsersLoggedResponseDto({
          ...user,
          settings: new UsersLoggedSetttingsResponseDto({
            ...user?.settings,
            chats: user?.settings?.chats?.map(
              (chat) => new UsersLoggedSetttingsChannelResponseDto(chat),
            ),
          }),
        }),
      ),
    });
    res.end();
  }

  @Delete('/session')
  @ApiOperation({ summary: 'Logout' })
  @ApiTags('Authentication')
  @UseGuards(AuthGuard)
  async logout(@Req() req: any, @Res() res: Response) {
    try {
      const refreshToken = req.refreshToken.id;
      const username = req.user.username;

      await this.authService.logout(username, [refreshToken]);

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
  async logoutById(
    @Req() req,
    @Body() body: DeleteSessionsRequestDto,
    @Res() res: Response,
  ) {
    try {
      await this.authService.logout(req.user.username, body.sessions);

      res.status(HttpStatus.NO_CONTENT);
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid session',
      });
    } finally {
      res.end();
    }
  }

  @Get('/sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiTags('Authentication')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getActiveSessions(@Req() req: any) {
    try {
      const sessions = await this.authService.getActiveSessions(
        req.user.username,
      );

      return {
        items: sessions.map((session) => new SessionResponse(session)),
        total: sessions.length,
      };
    } catch (error) {
      return { sessions: [] };
    }
  }
}
