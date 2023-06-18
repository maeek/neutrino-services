import { IsBase64, IsObject, IsOptional, IsString } from 'class-validator';

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class UsersResponseDto {
  id: string;
  username: string;
  createdAt: number;
  role?: UserRole;
  supportedLoginTypes: string[];
  sessions: string[];
  hash: string[];
  locked: boolean;
  credentials: Record<string, unknown>[];
  settings: Record<string, unknown>;
  avatar: string;
  description: string;
}

export class WebAuthnRequestResponseDto {
  @IsBase64()
  attestationObject: string;

  @IsBase64()
  clientDataJSON: string;

  @IsString({ each: true })
  transports: string[];
}

export class WebAuthnRequestDto {
  @IsBase64()
  id: string;

  @IsBase64()
  rawId: string;

  @IsString()
  authenticatorAttachment: string;

  @IsString()
  type: string;

  @IsObject()
  response: WebAuthnRequestResponseDto;
}

export class LoginRequestDto {
  @IsString()
  username: string;

  @IsString()
  method: 'password' | 'webauthn';

  @IsString()
  device: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsObject()
  webauthn?: WebAuthnRequestDto;

  user: UsersResponseDto;
}
