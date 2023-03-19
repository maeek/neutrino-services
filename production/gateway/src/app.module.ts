import { Logger, Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AdminController } from './controllers/admin.controller';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { AppService } from './services/app.service';
import { ConfigService } from './services/config/config.service';
import { ClientProxyFactory } from '@nestjs/microservices';
import { AdminService } from './services/admin.service';
import { AuthService } from './services/auth.service';
import { WebsocketService } from './services/websocket.service';
import { WebsocketController } from './controllers/websocket.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    AdminController,
    AuthController,
    UserController,
    WebsocketController,
  ],
  providers: [
    ConfigService,
    AppService,
    AdminService,
    AuthService,
    UserService,
    WebsocketService,
    Logger,
    {
      provide: 'ADMIN_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('adminService');
        return ClientProxyFactory.create(tokenServiceOptions);
      },
      inject: [ConfigService],
    },
    {
      provide: 'AUTH_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('authService');
        return ClientProxyFactory.create(tokenServiceOptions);
      },
      inject: [ConfigService],
    },
    {
      provide: 'WEBSOCKET_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('websocketService');
        return ClientProxyFactory.create(tokenServiceOptions);
      },
      inject: [ConfigService],
    },
    {
      provide: 'USER_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('userService');
        return ClientProxyFactory.create(tokenServiceOptions);
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
