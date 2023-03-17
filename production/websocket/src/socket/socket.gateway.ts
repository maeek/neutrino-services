import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// import { ConfigService } from '../services/config/config.service';
// const configService = new ConfigService();
// {
//   namespace: 'websocket',
//   path: '/websocket',
// }

@WebSocketGateway({ cors: { origin: ['http://localhost:8081'] } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  async handleConnection(socket: Socket) {
    // check token and disconnect if invalid
    // add socket to redis ??
    console.log('socket connected', socket.id);
    return socket.emit('message', 'Hello world!');
  }

  async handleDisconnect(socket: Socket) {
    // remove socket from redis ??
    console.log('socket disconnected', socket.id);
    return socket.disconnect();
  }

  @SubscribeMessage('message')
  async handleMessage(socket: Socket, payload: any) {
    console.log('message', payload);
    return 'Hello world!';
  }
}