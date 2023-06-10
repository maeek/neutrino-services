import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsOneOf } from './validators/isOneOf';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOneOf(['password', 'webauthn'])
  method?: 'password' | 'webauthn';

  @ApiProperty()
  @IsString()
  password?: string;

  @ApiProperty()
  @IsString()
  @IsOneOf([UserRole.ADMIN, UserRole.USER])
  role?: string;
}

export class CreateUserResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  role?: UserRole;

  @ApiProperty()
  createdAt: number;
}

export class UsersResponseDto {
  @Exclude()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  @Exclude()
  createdAt: number;

  @ApiProperty()
  role?: UserRole;

  @Exclude()
  supportedLoginTypes: string[];

  @Exclude()
  sessions: string[];

  @Exclude()
  hash: string[];

  @Exclude()
  locked: boolean;

  @Exclude()
  credentials: Record<string, unknown>[];

  @Exclude()
  settings: Record<string, unknown>;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  description: string;

  constructor(partial: Partial<UsersResponseDto>) {
    Object.assign(this, partial);
  }
}
