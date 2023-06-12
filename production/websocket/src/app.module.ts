import { Logger, Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { MessagesService } from './services/app.service';
import { ConfigService } from './services/config/config.service';
import { SocketGateway } from './socket/socket.gateway';
import { ChannelsRepository } from './services/channel.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';
import { ChannelSchema } from './schemas/channel.schema';
import { UserService } from './services/user.service';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ChannelsMgmtService } from './services/channels-mgmt.service';
import { WsAuthService } from './services/ws-auth.service';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Channel',
        schema: ChannelSchema,
        collection: 'channels',
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    MessagesService,
    SocketGateway,
    ConfigService,
    ChannelsRepository,
    ChannelsMgmtService,
    Logger,
    WsAuthService,
    AuthService,
    UserService,
    {
      provide: 'USER_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('userService');
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
  ],
})
export class AppModule {}
