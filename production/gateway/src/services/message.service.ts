import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  CreateGroupRequestDto,
  CreateGroupResponseDto,
  UpdateGroupRequestDto,
} from 'src/interfaces/message.interface';
import { UserService } from './user.service';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'websocket.getHealth',
  CREATE_GROUP = 'websocket.createGroup',
  GET_GROUPS = 'websocket.getGroups',
  GET_GROUP_BY_ID = 'websocket.getGroupById',
  UPDATE_GROUP_BY_ID = 'websocket.updateGroupById',
  DELETE_GROUP_BY_ID = 'websocket.deleteGroupById',
  PUT_USERS_IN_GROUP_BY_ID = 'websocket.putUsersInGroupById',
}

@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGE_SERVICE')
    private readonly messageServiceClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  async getHealth() {
    try {
      this.logger.debug('Sending health check to websocket service');

      const { status, message } = await firstValueFrom(
        this.messageServiceClient
          .send<{ status: 'ok' | 'unhealthy'; message: string }>(
            MESSAGE_PATTERNS.GET_HEALTH,
            {},
          )
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received health check from websocket service',
        status,
        message,
      );

      return {
        name: 'websocket',
        status,
        message,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        name: 'websocket',
        status: 'unhealthy',
        reason: error.message,
      };
    }
  }

  async createGroup(
    channel: CreateGroupRequestDto,
  ): Promise<CreateGroupResponseDto> {
    try {
      this.logger.debug('Sending create group to websocket service');

      const createdChannel = await firstValueFrom(
        this.messageServiceClient
          .send<CreateGroupResponseDto>(MESSAGE_PATTERNS.CREATE_GROUP, channel)
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received create group from websocket service',
        createdChannel,
      );

      return createdChannel;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getGroups(offset = 0, limit = 50, find?: string) {
    try {
      this.logger.debug('Sending get group to websocket service');

      const groups = await firstValueFrom(
        this.messageServiceClient
          .send<CreateGroupResponseDto[]>(MESSAGE_PATTERNS.GET_GROUPS, {
            offset,
            limit,
            find,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received get group from websocket service', groups);

      return groups;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getGroupById(id: string) {
    try {
      this.logger.debug('Sending get group by id to websocket service');

      const group = await firstValueFrom(
        this.messageServiceClient
          .send<CreateGroupResponseDto>(MESSAGE_PATTERNS.GET_GROUP_BY_ID, {
            id,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received get group by id from websocket service',
        group,
      );

      return group;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async updateGroupById(id: string, body: UpdateGroupRequestDto) {
    try {
      this.logger.debug('Sending update group by id to websocket service');

      const group = await firstValueFrom(
        this.messageServiceClient
          .send<UpdateGroupRequestDto>(MESSAGE_PATTERNS.UPDATE_GROUP_BY_ID, {
            id,
            body,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received update group by id from websocket service',
        group,
      );

      return group;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteGroupById(id: string) {
    try {
      this.logger.debug('Sending delete group by id to websocket service');

      const successful = await firstValueFrom(
        this.messageServiceClient
          .send<CreateGroupResponseDto>(MESSAGE_PATTERNS.DELETE_GROUP_BY_ID, {
            id,
          })
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received delete group by id from websocket service');

      return successful;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async putUsersInGroupById(
    id: string,
    list: 'users' | 'blockedUsers',
    ids: string[],
  ) {
    try {
      this.logger.debug(
        'Sending put users in group by id to websocket service',
      );

      const group = await firstValueFrom(
        this.messageServiceClient
          .send<CreateGroupResponseDto>(
            MESSAGE_PATTERNS.PUT_USERS_IN_GROUP_BY_ID,
            {
              id,
              list,
              ids,
            },
          )
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received put users in group by id from websocket service',
        group,
      );

      return group;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
