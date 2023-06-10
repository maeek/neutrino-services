import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class GetConfigResponseDto {
  @ApiProperty()
  registrationEnabled: boolean;
}

export class SetConfigRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  registrationEnabled: boolean;
}
