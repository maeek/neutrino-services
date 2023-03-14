import { Controller, Get } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { AdminService } from '../services/admin.service';
import { AppService } from '../services/app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @Get('/health')
  async getHealth() {
    const statuses = await Promise.all([
      this.appService.getHealth(),
      this.adminService.getHealth(),
      this.authService.getHealth(),
    ]);

    return {
      status: statuses.every(({ status }) => status === 'ok')
        ? 'ok'
        : 'unhealthy',
      services: statuses,
    };
  }
}
