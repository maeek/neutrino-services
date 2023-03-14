import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'websocket', path: '/websocket' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    // check token and disconnect if invalid
    // add socket to redis ??
    return socket.emit('message', 'Hello world!');
  }

  async handleDisconnect(socket: Socket) {
    // remove socket from redis ??
    return socket.disconnect();
  }

  @SubscribeMessage('message')
  async handleMessage(socket: Socket, payload: any) {
    return 'Hello world!';
  }
}
