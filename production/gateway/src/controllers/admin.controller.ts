import { Controller, Get, Patch } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/health')
  @ApiTags('Health')
  async getHealth() {
    return this.adminService.getHealth();
  }

  @Get('/config')
  @ApiOperation({ summary: 'Get server configuration' })
  @ApiTags('Configuration')
  async getConfig() {
    return {};
  }

  @Patch('/config')
  @ApiOperation({ summary: 'Update server configuration' })
  @ApiTags('Configuration')
  async setConfig() {
    return {};
  }

  @Get('/audit')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiTags('Configuration')
  async getAuditLogs() {
    return {};
  }
}
