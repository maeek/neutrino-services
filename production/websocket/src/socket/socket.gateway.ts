import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message, MessageTypes } from '../interfaces/messages.interface';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/guards/auth.guard';
import { WsAuthService } from 'src/services/ws-auth.service';
import { ChannelsMgmtService } from 'src/services/channels-mgmt.service';

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

  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly channelsService: ChannelsMgmtService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.wsAuthService.onClientConnect(client);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    return client.disconnect();
  }

  // handle messages
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: Message,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('message', payload);

    if (payload.type === MessageTypes.DIRECT) {
      return this.sendToRoom(
        `u/${payload.toId}`,
        'message',
        {
          ...payload,
          fromId: client.data.user.username,
        },
        client,
      );
    } else if (payload.type === MessageTypes.CHANNEL) {
      return this.sendToRoom(
        `c/${payload.toId}`,
        'message',
        {
          ...payload,
          fromId: client.data.user.username,
        },
        client,
      );
    }
  }

  // handle session logouts
  @SubscribeMessage('sessions')
  async handleSession(payload: any) {
    console.log('message', payload);
    return 'Hello world!';
  }

  async sendToRoom(
    room: string,
    event: string,
    data: Message,
    senderSocket?: Socket,
  ) {
    const roomClients = await this.server.in(room).fetchSockets();
    const usersWithoutSenderMuted = roomClients.filter(
      (client) => !client.data.user.muted?.includes(data.fromId),
    );

    return Promise.all(
      usersWithoutSenderMuted
        .filter((client) => client.id !== senderSocket?.id)
        .map((client) =>
          this.server.to(`u/${client.data.user.username}`).emit(event, data),
        ),
    );
  }

  // async sendToUser(
  //   username: string,
  //   event: string,
  //   data: { from: string; [key: string]: any },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   return;
  // }

  // async sendToUser(socketId: string, event: string, data: any) {
  //   return this.server.to(socketId).emit(event, data);
  // }

  async sendToAll(event: string, data: any) {
    return this.server.emit(event, data);
  }
}
