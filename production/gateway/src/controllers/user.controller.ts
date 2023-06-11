import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { isError } from 'src/interfaces/error.interface';
import { CreateUserDto, UsersResponseDto } from 'src/interfaces/user.interface';
import { IDParams } from 'src/interfaces/validators/id';
import { PaginationParams } from 'src/interfaces/validators/pagination';
import { UserService } from 'src/services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/health')
  @ApiTags('Health')
  async getHealth() {
    return this.userService.getHealth();
  }

  @Get('/')
  @ApiOperation({ summary: 'Browse users' })
  @ApiTags('Users')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async getUsers(@Query() query: PaginationParams) {
    const users = await this.userService.getUsers(
      query.offset,
      query.limit,
      query.find,
    );

    return {
      items: users.map((user) => new UsersResponseDto(user)),
      total: users.length,
    };
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiTags('Users')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);

    if (!user || isError(user)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      user: new UsersResponseDto(user),
    };
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get logged user' })
  @ApiTags('Users')
  async getLoggedUser() {
    return {};
  }

  @Post('/')
  @ApiOperation({ summary: 'Create user' })
  @ApiTags('Users')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @UseInterceptors(ClassSerializerInterceptor)
  async createUser(@Body() body: CreateUserDto) {
    try {
      const user = await this.userService.createUser(body);

      if (!user || isError(user)) {
        throw new Error('User not created');
      }

      return {
        user: new UsersResponseDto(user),
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: error.message,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiTags('Users')
  async updateUser() {
    return {};
  }

  // @Delete('/')
  // @ApiOperation({ summary: 'Delete logged user' })
  // @ApiTags('Users')
  // async removeUser() {
  //   return {};
  // }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiTags('Users')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async removeUserById(@Param() params: IDParams, @Res() res: Response) {
    const success = await this.userService.removeUser(params.id);

    if (!success) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    res.status(HttpStatus.NO_CONTENT).end();
  }

  @Get('/avatar/:id')
  @ApiOperation({ summary: 'Get user avatar by id' })
  @ApiTags('Users')
  async getUserAvatar() {
    return {};
  }
}
