import { IsJWT } from 'class-validator';

export class GetSessionAndRenewRequestDto {
  @IsJWT()
  refreshToken: string;

  @IsJWT()
  accessToken: string;
}
