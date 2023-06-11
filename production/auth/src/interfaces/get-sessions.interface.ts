import { IsString } from 'class-validator';

export class GetSessionsRequestDto {
  @IsString()
  username: string;
}
