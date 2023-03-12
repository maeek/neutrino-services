import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorFromService {
  message: string;
  code: HttpStatus;
  errors: string[];
}

export const formatErrorFromService = (error: ErrorFromService) =>
  new HttpException(
    {
      status: error.code,
      message: error.message,
      error: error.errors.join(', '),
    },
    error.code || HttpStatus.BAD_REQUEST,
  );
