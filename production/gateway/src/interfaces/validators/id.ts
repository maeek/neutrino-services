import { IsNotEmpty, IsString } from 'class-validator';

export class IDParams {
  @IsString()
  @IsNotEmpty()
  id: string;
}
