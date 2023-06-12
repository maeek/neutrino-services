import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
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
  @IsStrongPassword()
  password?: string;

  @ApiProperty()
  @IsEnum(UserRole)
  role?: string;
}

export class CreateUserResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  role?: UserRole;

  @ApiProperty()
  @Exclude()
  createdAt: number;

  @Exclude()
  supportedLoginTypes: string[];

  @Exclude()
  sessions: string[];

  @Exclude()
  hash: string[];

  @Exclude()
  credentials: Record<string, unknown>[];

  @Exclude()
  id: string;
}

export class UsersResponseDto {
  @Exclude()
  id: string;

  @ApiProperty()
  username: string;

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

export class UpdateUserRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  mutedUsers?: string[];

  @ApiProperty()
  @IsString({ each: true })
  @IsOptional()
  mutedChannels?: string[];

  constructor(partial: Partial<UpdateUserRequestDto>) {
    Object.assign(this, partial);
  }
}

export class UsersLoggedSetttingsChannelResponseDto {
  @Exclude()
  id: string;

  @ApiProperty()
  channel: string;

  @ApiProperty()
  muted: boolean;

  @ApiProperty()
  color: string;

  constructor(partial: Partial<UsersLoggedSetttingsResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UsersLoggedSetttingsResponseDto {
  @Exclude()
  id: string;

  @ApiProperty()
  mutedUsers: string[];

  @ApiProperty()
  chats: Record<string, unknown>[];

  constructor(partial: Partial<UsersLoggedSetttingsResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UsersLoggedResponseDto {
  @Exclude()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  createdAt: number;

  @ApiProperty()
  role?: UserRole;

  @ApiProperty()
  supportedLoginTypes: ('password' | 'webauthn')[];

  @ApiProperty()
  sessions: string[];

  @Exclude()
  hash: string[];

  @Exclude()
  locked: boolean;

  @Exclude()
  credentials: Record<string, unknown>[];

  @ApiProperty()
  settings: UsersLoggedSetttingsResponseDto;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  description: string;

  constructor(partial: Partial<UsersLoggedResponseDto>) {
    Object.assign(this, partial);
  }
}

export class SelfUserResponseDto {
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

  @ApiProperty()
  sessions: string[];

  @Exclude()
  hash: string[];

  @Exclude()
  locked: boolean;

  @Exclude()
  credentials: Record<string, unknown>[];

  @ApiProperty()
  settings: Record<string, unknown>;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  description: string;

  constructor(partial: Partial<UsersResponseDto>) {
    Object.assign(this, partial);
  }
}
