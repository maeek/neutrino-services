import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { UsersRepository } from './user.repository';
import { User, UserRole } from '../schemas/users.schema';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserRequestDto,
  WebAuthnRequestDto,
} from '../interfaces/create-user.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

enum AUTH_MESSAGE_PATTERNS {
  LOGOUT_ALL_SESSIONS = 'auth.logoutAllSessions',
}

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.initAdminUser();
  }

  async initAdminUser() {
    const adminUser = await this.usersRepository.findOne({
      username: 'admin',
    });

    if (!adminUser) {
      await this.createUserWithPassword(
        'admin',
        this.configService.get('ADMIN_PASSWORD'),
        UserRole.ADMIN,
      );
    }
  }

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

    return {
      users,
      total: await this.usersRepository.count({}),
    };
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
    await firstValueFrom(
      this.authServiceClient
        .send(AUTH_MESSAGE_PATTERNS.LOGOUT_ALL_SESSIONS, {
          username,
        })
        .pipe(timeout(5000)),
    );

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

  async setSessionToUser(username: string, session: string) {
    return this.usersRepository.findOneAndUpdate(
      { username },
      {
        $addToSet: {
          sessions: session,
        },
      },
    );
  }

  async removeSessionFromUser(username: string, session: string) {
    return this.usersRepository.findOneAndUpdate(
      { username },
      {
        $pull: {
          sessions: session,
        },
      },
    );
  }

  async updateUser(
    username: string,
    body: {
      description?: string;
      avatar?: string;
      currentPassword?: string;
      password?: string;
    },
  ) {
    if (body.currentPassword && body.password) {
      const user = await this.getUserWithPassword(
        username,
        body.currentPassword,
      );

      if (!user) {
        throw new Error('Invalid password');
      }

      const passwordSalt = await bcrypt.genSalt(
        this.configService.get('SALT_ROUNDS'),
      );
      const passwordHash = await bcrypt.hash(body.password, passwordSalt);

      return this.usersRepository.findOneAndUpdate(
        { username },
        {
          $set: {
            hash: passwordHash,
          },
        },
      );
    }

    return this.usersRepository.findOneAndUpdate(
      { username },
      {
        $set: {
          description: body.description,
          avatar: body.avatar,
        },
      },
    );
  }
}
