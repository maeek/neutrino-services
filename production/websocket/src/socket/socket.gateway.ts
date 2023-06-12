import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '../interfaces/messages.interface';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/guards/auth.guard';
import { WsAuthService } from 'src/services/ws-auth.service';
import { from } from 'rxjs';

@WebSocketGateway({
  path: '/ws',
  maxHttpBufferSize: 1e7, // 10MB
  serveClient: false,
  transports: ['websocket'],
  cookie: true,
})
@UseGuards(WsAuthGuard)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly wsAuthService: WsAuthService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    this.wsAuthService.onClientConnect(client);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    return client.disconnect();
  }

  @SubscribeMessage('message')
  async handleMessage(payload: Message) {
    console.log('message', payload);
    return 'Hello world!';
  }

  async subscribeToRoom(room: string, @ConnectedSocket() client: Socket) {
    return client.join(room);
  }

  async sendToRoom(room: string, event: string, data: any) {
    return this.server.to(room).emit(event, data);
  }

  async sendToUser(
    username: string,
    event: string,
    data: { from: string; [key: string]: any },
    @ConnectedSocket() client: Socket,
  ) {
    return;
  }

  // async sendToUser(socketId: string, event: string, data: any) {
  //   return this.server.to(socketId).emit(event, data);
  // }

  async sendToAll(event: string, data: any) {
    return this.server.emit(event, data);
  }
}
