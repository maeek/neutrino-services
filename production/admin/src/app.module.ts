import { Logger, Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ConfigService } from './services/config/config.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ConfigService, Logger],
})
export class AppModule {}
