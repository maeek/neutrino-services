import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UsersResponseDto } from 'src/interfaces/user.interface';
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
  async getUser(@Param('offset') page = 0, @Param('limit') limit = 50) {
    return {};
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
      skipMissingProperties: true,
    }),
  )
  async createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiTags('Users')
  async updateUser() {
    return {};
  }

  @Delete('/')
  @ApiOperation({ summary: 'Delete logged user' })
  @ApiTags('Users')
  async removeUser() {
    return {};
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiTags('Users')
  async removeUserById() {
    return {};
  }

  @Get('/avatar/:id')
  @ApiOperation({ summary: 'Get user avatar by id' })
  @ApiTags('Users')
  async getUserAvatar() {
    return {};
  }
}
