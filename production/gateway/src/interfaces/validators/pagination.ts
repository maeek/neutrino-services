import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class PaginationParams {
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Transform((value) => parseInt(value.value, 10))
  offset?: number;

  @IsNumber()
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform((value) => parseInt(value.value, 10))
  limit?: number;

  @IsString()
  @IsOptional()
  find?: string;
}
