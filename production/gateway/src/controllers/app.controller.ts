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
    const gatewayHealth = await this.appService.getHealth();
    const adminHealth = await this.adminService.getHealth();
    const authHealth = await this.authService.getHealth();

    return {
      services: [
        { name: 'gateway', status: gatewayHealth.status },
        { service: 'admin', status: adminHealth.status },
        { service: 'auth', status: authHealth.status },
      ],
    };
  }
}
