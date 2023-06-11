import { ApiProperty } from '@nestjs/swagger';
import {
  IsBase64,
  IsObject,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UsersResponseDto } from './user.interface';
import { Exclude } from 'class-transformer';

class WebAuthnRequestResponseDto {
  @IsBase64()
  @ApiProperty()
  attestationObject: string;

  @IsBase64()
  @ApiProperty()
  clientDataJSON: string;

  @IsString({ each: true })
  @ApiProperty()
  transports: string[];
}

class WebAuthnRequestDto {
  @ApiProperty()
  @IsBase64()
  id: string;

  @ApiProperty()
  @IsBase64()
  rawId: string;

  @ApiProperty()
  @IsString()
  authenticatorAttachment: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsObject()
  response: WebAuthnRequestResponseDto;
}

export class LoginRequestDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  method: 'password' | 'webauthn';

  @ApiProperty()
  @IsOptional()
  @IsStrongPassword()
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  webauthn?: WebAuthnRequestDto;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UsersResponseDto;
}

export class DeleteSessionsRequestDto {
  @ApiProperty()
  @IsString()
  sessions: string[];
}

export class SessionResponse {
  @Exclude()
  refreshToken: string;

  @Exclude()
  username: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: number;

  constructor(partial: Partial<SessionResponse>) {
    Object.assign(this, partial);
  }
}
