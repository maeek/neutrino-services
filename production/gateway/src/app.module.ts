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
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { UserService } from './services/user.service';
import { FileService } from './services/file.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    AdminController,
    AuthController,
    UserController,
    MessageController,
  ],
  providers: [
    ConfigService,
    AppService,
    AdminService,
    AuthService,
    UserService,
    MessageService,
    FileService,
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
      provide: 'MESSAGE_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('messageService');
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
