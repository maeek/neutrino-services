import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/jwt.guard';
import { RegistrationGuard } from 'src/guards/registration.guard';
import { isError } from 'src/interfaces/error.interface';
import {
  CreateUserDto,
  UpdateUserRequestDto,
  UserRole,
  UsersLoggedResponseDto,
  UsersLoggedSetttingsChannelResponseDto,
  UsersLoggedSetttingsResponseDto,
  UsersResponseDto,
} from 'src/interfaces/user.interface';
import { IDParams } from 'src/interfaces/validators/id';
import { PaginationParams } from 'src/interfaces/validators/pagination';
import { FileService } from 'src/services/file.service';
import { UserService } from 'src/services/user.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

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
    const response = await this.userService.getUsers(
      query.offset,
      query.limit,
      query.find,
    );

    return {
      items: response.users.map((user) => new UsersResponseDto(user)),
      total: response.total,
    };
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get logged user' })
  @ApiTags('Users')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async getLoggedUser(@Req() req) {
    const username = req.user.username;
    const user = await this.userService.getUser(username);
    return new UsersLoggedResponseDto({
      ...user,
      settings: new UsersLoggedSetttingsResponseDto({
        ...user.settings,
        chats: user.settings.chats.map(
          (chat) => new UsersLoggedSetttingsChannelResponseDto(chat),
        ),
      }),
    });
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
  @UseGuards(RegistrationGuard)
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
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async updateUser(
    @Req() req,
    @Param() params: IDParams,
    @Body() body: UpdateUserRequestDto,
  ) {
    const loggedUser = req.user;
    if (
      loggedUser.role !== UserRole.ADMIN &&
      loggedUser.username !== params.id
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'Forbidden',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const user = await this.userService.updateUser(params.id, body);
    return loggedUser.username === params.id
      ? new UsersLoggedResponseDto({
          ...user,
          settings: new UsersLoggedSetttingsResponseDto({
            ...user.settings,
            chats: user.settings.chats.map(
              (chat) => new UsersLoggedSetttingsChannelResponseDto(chat),
            ),
          }),
        })
      : new UsersResponseDto(user);
  }

  @Put('/:id/avatar')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiTags('Users')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserAvatar(
    @Param() params: IDParams,
    @Res() res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: new RegExp('image/.+'),
          }),
          // 1MB
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (file) {
      const user = await this.userService.getUser(params.id);
      const avatar = await this.fileService.saveAvatarFile(
        params.id,
        user.avatar,
        file,
      );
      await this.userService.updateUser(params.id, {
        avatar: avatar.split('/').pop(),
        updateAvatar: true,
      });
    }

    res.status(HttpStatus.CREATED).end();
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiTags('Users')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async removeUserById(
    @Param() params: IDParams,
    @Res() res: Response,
    @Req() req,
  ) {
    if (req.user.username !== params.id || req.user.role !== UserRole.ADMIN) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({
          statusCode: HttpStatus.FORBIDDEN,
          error: 'Forbidden',
        })
        .end();
      return;
    }

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

  @Get('/:id/avatar')
  @ApiOperation({ summary: 'Get user avatar by id' })
  @ApiTags('Users')
  async getUserAvatar(
    @Param() params: IDParams,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.fileService.getAvatarFile(params.id);
    res.set({
      'Content-Type': 'image/png',
    });
    return new StreamableFile(file);
  }
}
