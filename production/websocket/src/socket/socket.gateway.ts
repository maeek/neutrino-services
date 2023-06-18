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
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  path: '/ws',
  maxHttpBufferSize: 1e8, // 100MB
  serveClient: false,
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

  @SubscribeMessage('joinChannel')
  async joinChannelRequest(
    @MessageBody() payload: { name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const channel = await this.channelsService.getGroupById(payload.name);

    if (
      !channel ||
      channel.blockedUsers.includes(client.data.user.id) ||
      (!channel.public && !channel.users.includes(client.data.user.id))
    ) {
      return;
    }

    client.join(`c/${payload.name}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: Message,
    @ConnectedSocket() client: Socket,
  ) {
    if (payload.type === MessageTypes.DIRECT) {
      return this.sendToRoom(`u/${payload.toId}`, 'message', {
        ...payload,
        fromId: client.data.user.username,
        serverUuid: uuidv4(),
      });
    } else if (payload.type === MessageTypes.CHANNEL) {
      return this.sendToRoom(`c/${payload.toId}`, 'message', {
        ...payload,
        fromId: client.data.user.username,
        serverUuid: uuidv4(),
      });
    }
  }

  async logoutSessionsForUser(username: string, sessionId?: string) {
    const sockets = await this.server.to(`u/${username}`).fetchSockets();

    await Promise.all(
      sockets
        .flat()
        .filter(
          (socket) => !sessionId || socket.data.user.sessionId === sessionId,
        )
        .map(async (socket) => {
          socket.emit('sessions', { logout: true });
          return socket.disconnect();
        }),
    );

    return {
      success: true,
    };
  }

  async getSocketsForUsers(users: string[]) {
    return Promise.all(
      users.map((username) => this.server.to(`u/${username}`).fetchSockets()),
    );
  }

  async sendToRoom(room: string, event: string, data: Message) {
    const roomClients = await this.server.in(room).fetchSockets();
    const usersWithoutSenderMuted = roomClients.filter(
      (client) => !client.data.user.muted?.includes(data.fromId),
    );
    const uniqueUsers = [
      ...new Set(usersWithoutSenderMuted.map((c) => c.data.user.username)),
    ];

    return Promise.all([
      ...uniqueUsers.map((username) =>
        this.server.to(`u/${username}`).emit(event, data),
      ),
      ...(uniqueUsers.find((c) => c === data.fromId)
        ? []
        : [this.server.to(`u/${data.fromId}`).emit(event, data)]),
    ]);
  }

  async sendToAll(event: string, data: any) {
    return this.server.emit(event, data);
  }
}
