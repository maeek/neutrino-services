import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/health')
  @ApiTags('Health')
  async getHealth() {
    return this.messageService.getHealth();
  }

  @Post('/group')
  @ApiOperation({ summary: 'Create discussion group' })
  @ApiTags('Messages')
  async createGroup() {
    return {};
  }

  @Get('/groups')
  @ApiOperation({ summary: 'Get discussion groups' })
  @ApiTags('Messages')
  async getGroup() {
    return {};
  }

  @Get('/groups/:id')
  @ApiOperation({ summary: 'Get discussion group by id' })
  @ApiTags('Messages')
  async getGroupById() {
    return {};
  }

  @Post('/groups/:id')
  @ApiOperation({ summary: 'Update discussion group by id' })
  @ApiTags('Messages')
  async updateGroupById() {
    return {};
  }

  @Delete('/groups/:id')
  @ApiOperation({ summary: 'Delete discussion group by id' })
  @ApiTags('Messages')
  async deleteGroupById() {
    return {};
  }

  @Put('/groups/:id')
  @ApiOperation({ summary: 'Put users in discussion group by id' })
  @ApiTags('Messages')
  async putUsersInGroupById() {
    return {};
  }
}
