import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/services/user.service';

@Controller('user')
@ApiTags('Health')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/health')
  async getHealth() {
    return this.userService.getHealth();
  }
}
