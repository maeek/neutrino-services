import { IsOptional, IsString } from 'class-validator';

export class LogoutRequestDto {
  @IsString()
  username: string;

  @IsString({ each: true })
  @IsOptional()
  sessions: string[];
}
