import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsOneOf } from './validators/isOneOf';

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
