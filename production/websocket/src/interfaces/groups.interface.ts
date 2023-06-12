import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateGroupRequestDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 64)
  name: string;

  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @IsOptional()
  users?: string[];

  @IsOptional()
  blockedUsers?: string[];

  @IsString()
  owner: string;
}

export class UpdateGroupRequestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @IsOptional()
  users?: string[];

  @IsOptional()
  blockedUsers?: string[];
}

export class PutUsersInGroupRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  list: 'users' | 'blockedUsers';

  @IsArray()
  ids: string[];
}

export class GetGroupById {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class GetGroupsRequestDto {
  @IsNumber()
  @IsOptional()
  offset?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  find?: string;
}

export class CreateGroupResponseDto {
  @Exclude()
  id: string;

  name: string;

  createdAt: number;

  public: boolean;

  users: string[];

  blockedUsers: string[];
}
