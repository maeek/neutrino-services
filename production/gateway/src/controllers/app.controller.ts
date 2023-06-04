import { Controller, Get } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { UserService } from 'src/services/user.service';
import { WebsocketService } from 'src/services/message.service';
import { AdminService } from '../services/admin.service';
import { AppService } from '../services/app.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly websocketService: WebsocketService,
  ) {}

  @Get('/health')
  @ApiOkResponse({
    description: 'Returns the health of the application',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ok', 'unhealthy'],
        },
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              status: {
                type: 'string',
                enum: ['ok', 'unhealthy'],
              },
            },
          },
        },
      },
    },
  })
  async getHealth() {
    const statuses = await Promise.all([
      this.appService.getHealth(),
      this.adminService.getHealth(),
      this.authService.getHealth(),
      this.userService.getHealth(),
      this.websocketService.getHealth(),
    ]);

    return {
      status: statuses.every(({ status }) => status === 'ok')
        ? 'ok'
        : 'unhealthy',
      services: statuses,
    };
  }
}
