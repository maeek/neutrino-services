import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  GetConfigResponseDto,
  SetConfigRequestDto,
} from 'src/interfaces/admin.interface';

enum MESSAGE_PATTERNS {
  GET_HEALTH = 'admin.getHealth',
  GET_CONFIG = 'admin.getConfig',
  SET_CONFIG = 'admin.setConfig',
  GET_AUDIT_LOGS = 'admin.getAuditLogs',
}

@Injectable()
export class AdminService {
  constructor(
    @Inject('ADMIN_SERVICE')
    private readonly adminServiceClient: ClientProxy,
    private readonly logger: Logger,
  ) {}

  async getHealth() {
    try {
      this.logger.debug('Sending health check to admin service');

      const { status, message } = await firstValueFrom(
        this.adminServiceClient
          .send<{ status: 'ok' | 'unhealthy'; message: string }>(
            MESSAGE_PATTERNS.GET_HEALTH,
            {},
          )
          .pipe(timeout(5000)),
      );

      this.logger.debug(
        'Received health check from admin service',
        status,
        message,
      );

      return {
        name: 'admin',
        status,
        message,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        name: 'admin',
        status: 'unhealthy',
        reason: error.message,
      };
    }
  }

  async getConfig(): Promise<GetConfigResponseDto> {
    try {
      this.logger.debug('Sending config request to admin service');

      const config = await firstValueFrom(
        this.adminServiceClient
          .send<GetConfigResponseDto>(MESSAGE_PATTERNS.GET_CONFIG, {})
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received config from admin service', config);

      return config;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async setConfig(config: SetConfigRequestDto) {
    try {
      this.logger.debug('Sending config update to admin service');

      const updatedConfig = await firstValueFrom(
        this.adminServiceClient
          .send<GetConfigResponseDto>(MESSAGE_PATTERNS.SET_CONFIG, config)
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received updated config from admin service');

      return updatedConfig;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getAuditLogs() {
    try {
      this.logger.debug('Sending audit log request to admin service');

      const auditLogs = await firstValueFrom(
        this.adminServiceClient
          .send(MESSAGE_PATTERNS.GET_AUDIT_LOGS, {})
          .pipe(timeout(5000)),
      );

      this.logger.debug('Received audit logs from admin service', auditLogs);

      return auditLogs;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
