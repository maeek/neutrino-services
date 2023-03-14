import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { SocketGateway } from './socket/socket.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}
