import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controllers/app.controller';
import { UserSchema } from './schemas/users.schema';
import { AppService } from './services/app.service';
import { MongoConfigService } from './services/config/mongo-config.service';
import { UsersRepository } from './services/user.repository';
import { ConfigService } from './services/config/config.service';
import { ClientProxyFactory } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        collection: 'users',
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    UsersRepository,
    ConfigService,
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
