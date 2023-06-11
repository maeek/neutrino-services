import { IsBase64 } from 'class-validator';

export class LogoutRequestDto {
  @IsBase64()
  refreshToken: string;
}
