import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagesService } from '../services/app.service';
import {
  CreateGroupRequestDto,
  GetGroupById,
  GetGroupsRequestDto,
  PutUsersInGroupRequestDto,
  UpdateGroupRequestDto,
} from '../interfaces/groups.interface';
import { ChannelsMgmtService } from 'src/services/channels-mgmt.service';
import { SocketGateway } from 'src/socket/socket.gateway';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'websocket.getHealth',
  CREATE_GROUP = 'websocket.createGroup',
  GET_GROUPS = 'websocket.getGroups',
  GET_GROUP_BY_ID = 'websocket.getGroupById',
  UPDATE_GROUP_BY_ID = 'websocket.updateGroupById',
  DELETE_GROUP_BY_ID = 'websocket.deleteGroupById',
  PUT_USERS_IN_GROUP_BY_ID = 'websocket.putUsersInGroupById',
  CLOSE_SESSIONS = 'websocket.closeSessions',
  MUTE_USERS = 'websocket.muteUsers',
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: MessagesService,
    private readonly channelsMgmtService: ChannelsMgmtService,
    private readonly socketGateway: SocketGateway,
    private readonly logger: Logger,
  ) {}

  @MessagePattern(MESSAGE_PATTERNS.GET_HEALTH)
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('/ws/health')
  getHealthHttp() {
    return this.appService.getHealth();
  }

  @MessagePattern(MESSAGE_PATTERNS.CREATE_GROUP)
  async createGroup(@Body() body: CreateGroupRequestDto) {
    try {
      const group = await this.channelsMgmtService.createGroup(
        body,
        body.owner,
      );

      console.log('CREATE CHANNEL BODYY', body);
      const sockets = await this.socketGateway.getSocketsForUsers([
        body.owner,
        ...body.users,
      ]);
      console.log(sockets.flat().map((socket) => socket.data.user.username));
      sockets.flat().forEach((socket) => {
        socket.join(`c/${group.name}`);
      });

      return group;
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Failed to create group',
      };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_GROUPS)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getGroups(@Body() body: GetGroupsRequestDto) {
    return this.channelsMgmtService.getGroups(
      body.offset,
      body.limit,
      body.find,
    );
  }

  @MessagePattern(MESSAGE_PATTERNS.GET_GROUP_BY_ID)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getGroupById(@Body() body: GetGroupById) {
    return this.channelsMgmtService.getGroupById(body.id);
  }

  @MessagePattern(MESSAGE_PATTERNS.UPDATE_GROUP_BY_ID)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateGroupById(@Body() { name, ...body }: UpdateGroupRequestDto) {
    return this.channelsMgmtService.updateGroupById(name, body);
  }

  @MessagePattern(MESSAGE_PATTERNS.DELETE_GROUP_BY_ID)
  async deleteGroupById(@Body() body: GetGroupById) {
    return this.channelsMgmtService.deleteGroupById(body.id);
  }

  @MessagePattern(MESSAGE_PATTERNS.PUT_USERS_IN_GROUP_BY_ID)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async putUsersInGroupById(@Body() body: PutUsersInGroupRequestDto) {
    try {
      await this.channelsMgmtService.putUsersInGroupById(
        body.id,
        body.list,
        body.ids,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Users added to group',
      };
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to add users to group',
      };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.CLOSE_SESSIONS)
  async closeSessions(
    @Body() body: { users: { id: string; sessionId?: string }[] },
  ) {
    try {
      await Promise.all(
        body.users.map((user) => {
          return this.socketGateway.logoutSessionsForUser(
            user.id,
            user.sessionId,
          );
        }),
      );
      return {
        message: 'Sessions closed',
      };
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to close sessions',
      };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.MUTE_USERS)
  async muteUsers(@Body() body: { username: string; users: string[] }) {
    try {
      await this.socketGateway.muteUserForUser(body.username, body.users);
      return {
        message: 'Users muted',
      };
    } catch (error) {
      this.logger.error(error);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to mute users',
      };
    }
  }
}
