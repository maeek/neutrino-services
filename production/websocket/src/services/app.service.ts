import { Injectable } from '@nestjs/common';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class AppService {
  constructor(private readonly socketGateway: SocketGateway) {}

  getHealth() {
    return {
      status: 'ok',
    };
  }

  async sendToAll(event: string, data: any) {
    return this.socketGateway.sendToAll(event, data);
  }
}
