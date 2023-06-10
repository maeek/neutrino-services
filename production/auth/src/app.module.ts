import { CacheModule, Logger, Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';
import { TokenSchema } from './schemas/token.schema';
import { TokensRepository } from './services/token.repository';
import { ConfigService } from './services/config/config.service';
import { WebAuthnService } from './services/webauthn.service';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-ioredis-yet';
import { ClientProxyFactory } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Token',
        schema: TokenSchema,
        collection: 'tokens',
      },
    ]),
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: () => {
        const configService = new ConfigService();

        return {
          store: redisStore,
          ttl: 60000,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TokensRepository,
    ConfigService,
    WebAuthnService,
    Logger,
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
