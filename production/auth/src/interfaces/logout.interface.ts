import { IsString } from 'class-validator';

export class LogoutRequestDto {
  @IsString()
  username: string;

  @IsString()
  sessionId: string;
}
