import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
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

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'websocket.getHealth',
  CREATE_GROUP = 'websocket.createGroup',
  GET_GROUPS = 'websocket.getGroups',
  GET_GROUP_BY_ID = 'websocket.getGroupById',
  UPDATE_GROUP_BY_ID = 'websocket.updateGroupById',
  DELETE_GROUP_BY_ID = 'websocket.deleteGroupById',
  PUT_USERS_IN_GROUP_BY_ID = 'websocket.putUsersInGroupById',
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: MessagesService,
    private readonly channelsMgmtService: ChannelsMgmtService,
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
}
