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
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateGroupRequestDto,
  CreateGroupResponseDto,
  PutUsersInGroupRequestDto,
  UpdateGroupRequestDto,
} from '../interfaces/message.interface';
import { PaginationParams } from 'src/interfaces/validators/pagination';
import { IDParams } from 'src/interfaces/validators/id';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserRole } from 'src/interfaces/user.interface';
import { UserService } from 'src/services/user.service';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly usersService: UserService,
  ) {}

  @Get('/health')
  @ApiTags('Health')
  async getHealth() {
    return this.messageService.getHealth();
  }

  @Post('/group')
  @ApiOperation({ summary: 'Create discussion group' })
  @ApiBody({ type: CreateGroupRequestDto })
  @ApiTags('Messages')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @UseInterceptors(ClassSerializerInterceptor)
  async createGroup(
    @Req() req,
    @Body() body: CreateGroupRequestDto,
  ): Promise<CreateGroupResponseDto> {
    const user = req.user.username;
    const createdGroup = await this.messageService.createGroup(body, user);
    const users = await this.usersService.getUsersByObjectIds([
      ...createdGroup.users,
      ...createdGroup.blockedUsers,
    ]);

    return new CreateGroupResponseDto({
      ...createdGroup,
      users: users
        .filter((u) => createdGroup.users.includes(u.id))
        .map((u) => u.username),
      blockedUsers: users
        .filter((u) => createdGroup.blockedUsers.includes(u.id))
        .map((u) => u.username),
    });
  }

  @Get('/groups')
  @ApiOperation({ summary: 'Get discussion groups' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiTags('Messages')
  @UseInterceptors(ClassSerializerInterceptor)
  async getGroup(@Query() query: PaginationParams, @Req() req: any) {
    const groups = await this.messageService.getGroups(
      query.offset,
      query.limit,
      query.find,
    );

    const groupsThatUserCanSee = groups.filter((group) => {
      return (
        ((group.public || group.users.includes(req.user.id)) &&
          !group.blockedUsers.includes(req.user.id)) ||
        req.user.role === UserRole.ADMIN
      );
    });

    const groupsWithUsers = await Promise.all(
      groupsThatUserCanSee.map(async (group) => {
        const users = await this.usersService.getUsersByObjectIds([
          group.owner,
          ...group.users,
          ...group.blockedUsers,
        ]);

        return {
          ...group,
          owner: users.find((u) => u.id === group.owner).username,
          users: users
            .filter((u) => group.users.includes(u.id))
            .map((u) => u.username),
          blockedUsers: users
            .filter((u) => group.blockedUsers.includes(u.id))
            .map((u) => u.username),
        };
      }),
    );

    return {
      items: groupsWithUsers.map((group) => new CreateGroupResponseDto(group)),
      total: groups.length,
    };
  }

  @Get('/groups/:id')
  @ApiOperation({ summary: 'Get discussion group by id' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiTags('Messages')
  @UseInterceptors(ClassSerializerInterceptor)
  async getGroupById(@Param() params: IDParams) {
    const group = await this.messageService.getGroupById(params.id);

    const users = await this.usersService.getUsersByObjectIds([
      ...group.users,
      ...group.blockedUsers,
    ]);

    if (!group) {
      throw new HttpException('Group not found', 404);
    }

    return {
      group: new CreateGroupResponseDto({
        ...group,
        users: users
          .filter((u) => group.users.includes(u.id))
          .map((u) => u.username),
        blockedUsers: users
          .filter((u) => group.blockedUsers.includes(u.id))
          .map((u) => u.username),
      }),
    };
  }

  @Post('/groups/:id')
  @ApiOperation({ summary: 'Update discussion group by id' })
  @ApiTags('Messages')
  async updateGroupById(
    @Param() params: IDParams,
    @Body() body: UpdateGroupRequestDto,
  ) {
    return this.messageService.updateGroupById(params.id, body);
  }

  @Delete('/groups/:id')
  @ApiOperation({ summary: 'Delete discussion group by id' })
  @ApiAcceptedResponse()
  @ApiNoContentResponse()
  @ApiTags('Messages')
  async deleteGroupById(
    @Req() req,
    @Param() params: IDParams,
    @Res() res: Response,
  ) {
    const user = req.user;
    const channel = await this.messageService.getGroupById(params.id);

    if (user.role !== UserRole.ADMIN || channel.users[0] !== user.username) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Forbidden',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.messageService.deleteGroupById(params.id);

    res.status(HttpStatus.NO_CONTENT).end();
  }

  @Put('/groups/:id')
  @ApiOperation({ summary: 'Put users in discussion group by id' })
  @ApiTags('Messages')
  async putUsersInGroupById(
    @Param() params: IDParams,
    @Body() body: PutUsersInGroupRequestDto,
  ) {
    return this.messageService.putUsersInGroupById(
      params.id,
      body.list,
      body.ids,
    );
  }
}
