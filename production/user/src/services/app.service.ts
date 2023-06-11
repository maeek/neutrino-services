import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { UsersRepository } from './user.repository';
import { User, UserRole } from '../schemas/users.schema';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserRequestDto,
  WebAuthnRequestDto,
} from '../interfaces/create-user.interface';

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
    const users = await this.usersRepository.find(
      find
        ? {
            username: {
              $startsWith: find,
            },
          }
        : {},
      offset,
      limit,
    );

    return users;
  }

  async getUser(username: string): Promise<User> {
    return this.usersRepository.findOne({ username });
  }

  async getLoggedUser(token: string) {
    return {};
  }

  async createUser(body: CreateUserRequestDto) {
    if (await this.getUser(body.username)) {
      throw new Error('User already exists');
    }

    if (body.method === 'password') {
      return this.createUserWithPassword(
        body.username,
        body.password,
        body.role,
      );
    } else if (body.method === 'webauthn') {
      return this.createUserWithWebAuthn(
        body.username,
        body.webauthn,
        body.role,
      );
    }

    throw new Error('Invalid login method');
  }

  async createUserWithPassword(
    username: string,
    password: string,
    role: string,
  ) {
    const passwordSalt = await bcrypt.genSalt(
      this.configService.get('SALT_ROUNDS'),
    );
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    const user = await this.usersRepository.create({
      username,
      hash: passwordHash,
      role,
    });

    return user;
  }

  async createUserWithWebAuthn(
    username: string,
    webAuthnRequest: WebAuthnRequestDto,
    role: string,
  ) {
    return {};
  }

  async removeUser(username: string): Promise<boolean> {
    const removed = await this.usersRepository.remove({ username });

    return removed.acknowledged && removed.deletedCount > 0;
  }

  async getUserWithPassword(username: string, password: string) {
    try {
      const user = await this.getUser(username);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      const passwordValid = await bcrypt.compare(password, user.hash);

      if (!passwordValid) {
        throw new Error('Invalid username or password');
      }

      return user;
    } catch (error) {
      return null;
    }
  }
}
