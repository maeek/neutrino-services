import { Logger, Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ConfigService } from './services/config/config.service';
import { SocketGateway } from './socket/socket.gateway';
import { ChannelsRepository } from './services/channel.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';
import { ChannelSchema } from './schemas/channel.schema';
import { UserService } from './services/user.service';
import { ClientProxyFactory } from '@nestjs/microservices';

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
    AppService,
    SocketGateway,
    ConfigService,
    ChannelsRepository,
    Logger,
    UserService,
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
