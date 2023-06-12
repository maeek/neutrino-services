import { Injectable } from '@nestjs/common';
import { ChannelsRepository } from './channel.repository';
import { UserService } from './user.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly channelRepository: ChannelsRepository,
    private readonly userService: UserService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
    };
  }
}
