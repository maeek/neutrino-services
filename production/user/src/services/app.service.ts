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

  public async getUser(params: { username: string }): Promise<User> {
    return this.usersRepository.findOne(params);
  }

  public async createUserWithPassword(
    user: User & { password: string },
  ): Promise<any> {
    const { password, ...rest } = user;

    if (await this.usersRepository.exists({ username: user.username })) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const salt = await bcrypt.genSalt(this.configService.get('SALT_ROUNDS'));
    const hash = await bcrypt.hash(password, salt);

    return this.usersRepository.create({
      hash,
      ...rest,
    });
  }

  getHealth() {
    return { status: 'ok' };
  }
}
