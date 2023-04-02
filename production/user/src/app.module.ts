import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controllers/app.controller';
import { UserSchema } from './schemas/users.schema';
import { AppService } from './services/app.service';
import { MongoConfigService } from './services/config/mongo-config.service';
import { SettingsSchema } from './schemas/settings.schema';
import { CredentialSchema } from './schemas/credentials.schema';
import { UsersRepository } from './services/user.repository';
import { ConfigService } from './services/config/config.service';

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
      {
        name: 'Settings',
        schema: SettingsSchema,
        collection: 'settings',
      },
      {
        name: 'Credentials',
        schema: CredentialSchema,
        collection: 'credentials',
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, Logger, UsersRepository, ConfigService],
})
export class AppModule {}
