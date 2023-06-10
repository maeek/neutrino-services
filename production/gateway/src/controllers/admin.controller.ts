import {
  Body,
  Controller,
  Get,
  Patch,
  // SetMetadata,
  // UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetConfigResponseDto,
  SetConfigRequestDto,
} from '../interfaces/admin.interface';
// import { UserRole } from '../interfaces/user.interface';
// import { RolesGuard } from '../guards/roles.guard';

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
  async getConfig(): Promise<GetConfigResponseDto> {
    return this.adminService.getConfig();
  }

  @Patch('/config')
  @ApiOperation({ summary: 'Update server configuration' })
  @ApiTags('Configuration')
  // @SetMetadata('roles', [UserRole.ADMIN])
  // @UseGuards(RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async setConfig(
    @Body() config: SetConfigRequestDto,
  ): Promise<GetConfigResponseDto> {
    return this.adminService.setConfig(config);
  }

  @Get('/audit')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiTags('Configuration')
  // @SetMetadata('roles', [UserRole.ADMIN])
  // @UseGuards(RolesGuard)
  async getAuditLogs() {
    try {
      const logs = await this.adminService.getAuditLogs();

      return {
        logs,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
}
