import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

enum MESSAGE_PATTERNS {
  GET_USERS_BY_IDS = 'user.getUsersByIds',
}

interface User {
  id: string;
  username: string;
}

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE')
    private readonly usersServiceClient: ClientProxy,
  ) {}

  async getUsersByIds(ids: string[]) {
    return firstValueFrom(
      this.usersServiceClient
        .send<User[]>(MESSAGE_PATTERNS.GET_USERS_BY_IDS, { ids })
        .pipe(timeout(5000)),
    );
  }

  async getUsersObjectIdsByIds(ids: string[]) {
    const users = await this.getUsersByIds(ids);
    return users.map((user) => user.id);
  }
}
