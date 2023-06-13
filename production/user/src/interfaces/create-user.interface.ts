import {
  IsBase64,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from 'src/schemas/users.schema';

export class WebAuthnRequestResponseDto {
  @IsBase64()
  attestationObject: string;

  @IsBase64()
  clientDataJSON: string;

  @IsString({ each: true })
  transports: string[];
}

export class WebAuthnRequestDto {
  @IsString()
  credentialId: string;

  @IsString()
  publicKey: string;

  @IsString({ each: true })
  transports: string[];

  @IsString()
  counter: number;
}

export class CreateUserRequestDto {
  @IsString()
  username: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  method: 'password' | 'webauthn';

  @IsOptional()
  @IsStrongPassword()
  password?: string;

  @IsOptional()
  @IsObject()
  webauthn?: WebAuthnRequestDto;
}
