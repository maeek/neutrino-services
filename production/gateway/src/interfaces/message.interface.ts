import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { IsOneOf } from './validators/isOneOf';
import { Exclude } from 'class-transformer';

export class CreateGroupRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(2, 64)
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  users?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  blockedUsers?: string[];
}

export class UpdateGroupRequestDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  users?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  blockedUsers?: string[];
}

export class PutUsersInGroupRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOneOf(['users', 'blockedUsers'])
  list: 'users' | 'blockedUsers';

  @ApiProperty()
  @IsArray()
  @IsOptional()
  ids?: string[];
}

export class CreateGroupResponseDto {
  @Exclude()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: number;

  @ApiProperty()
  public: boolean;

  @ApiProperty()
  users: string[];

  @ApiProperty()
  blockedUsers: string[];

  constructor(partial: Partial<CreateGroupResponseDto>) {
    Object.assign(this, partial);
  }
}
