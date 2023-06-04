import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Health')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/health')
  async getHealth() {
    return this.adminService.getHealth();
  }
}
