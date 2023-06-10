import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { UsersRepository } from './user.repository';
import { User, UserRole } from 'src/schemas/users.schema';
import * as bcrypt from 'bcryptjs';

export interface CreateUserWithPasswordDto {
  username: string;
  password: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
  ) {}

  getHealth() {
    return { status: 'ok' };
  }

  async getUsers(offset: number, limit: number, find: string) {
    const users = await this.usersRepository.find({
      offset,
      limit,
      find,
    });

    return users;
  }

  async getUser(params: { username: string }): Promise<User> {
    return this.usersRepository.findOne(params);
  }

  async getLoggedUser(token: string) {
    return {};
  }

  async createUser() {
    return {};
  }
}
