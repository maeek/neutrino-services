import { Injectable } from '@nestjs/common';
import {
  CreateGroupRequestDto,
  UpdateGroupRequestDto,
} from '../interfaces/groups.interface';
import { ChannelsRepository } from './channel.repository';
import { UserService } from './user.service';

@Injectable()
export class ChannelsMgmtService {
  constructor(
    private readonly channelRepository: ChannelsRepository,
    private readonly userService: UserService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
    };
  }

  async createGroup(body: CreateGroupRequestDto, owner?: string) {
    const users = await this.userService.getUsersObjectIdsByIds([
      owner,
      ...(body?.users || []),
    ]);
    const blockedUsers = body.blockedUsers
      ? await this.userService.getUsersObjectIdsByIds(body.blockedUsers)
      : [];

    // If even the owner is not found, throw an error
    if (users.length === 0) {
      throw new Error('No users found');
    }

    const exists = await this.channelRepository.findOne({
      name: body.name,
    });

    if (exists) {
      throw new Error('Group already exists');
    }

    const createdGroup = await this.channelRepository.create({
      name: body.name,
      public: body.public || false,
      users,
      blockedUsers,
    });

    return {
      name: createdGroup.name,
      public: createdGroup.public,
      users: createdGroup.users,
      blockedUsers: createdGroup.blockedUsers,
      createdAt: createdGroup.createdAt,
    };
  }

  async getGroups(offset = 0, limit = 50, find?: string) {
    return await this.channelRepository.find(
      find
        ? {
            name: {
              $startsWith: find,
            },
          }
        : {},
      offset,
      limit,
    );
  }

  async getGroupById(id: string) {
    return this.channelRepository.findOne({ name: id });
  }

  async getGroupsWithUser(user: string) {
    return this.channelRepository.find({
      users: {
        $in: [user],
      },
    });
  }

  async updateGroupById(
    id: string,
    updatedBody: Omit<UpdateGroupRequestDto, 'name'>,
  ) {
    return this.channelRepository.findOneAndUpdate(
      { name: id },
      {
        public: updatedBody.public,
        users: updatedBody.users,
        blockedUsers: updatedBody.blockedUsers,
      },
    );
  }

  async deleteGroupById(id: string) {
    const { acknowledged } = await this.channelRepository.remove({ name: id });

    return acknowledged;
  }

  async putUsersInGroupById(id: string, list: string, ids: string[]) {
    const users = await this.userService.getUsersObjectIdsByIds(ids);

    if (users.length === 0) {
      throw new Error('No users found');
    }

    return this.channelRepository.findOneAndUpdate(
      { name: id },
      {
        [list]: {
          $push: users,
        },
      },
    );
  }
}
