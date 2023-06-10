import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import * as fs from 'fs';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService, private logger: Logger) {}

  getHealth() {
    return { status: 'ok' };
  }

  async getConfig() {
    try {
      return this.configService.getServerConfig();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async setConfig(config: any) {
    try {
      return this.configService.setServerConfig(config);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getAuditLogs() {
    try {
      if (
        !fs.existsSync(this.configService.get('SERVER_CONFIG_PATH')) ||
        !fs.existsSync(
          `${this.configService.get('SERVER_CONFIG_PATH')}/audit.log`,
        )
      ) {
        await this.configService.initAuditLogFile();
      }

      const logs = await fs.promises.readFile(
        `${this.configService.get('SERVER_CONFIG_PATH')}/audit.log`,
        'utf8',
      );

      return logs
        .split('\n')
        .filter(Boolean)
        .map((log) => {
          try {
            return JSON.parse(log);
          } catch (error) {
            return log;
          }
        });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async writeLog(log: any) {
    try {
      if (!fs.existsSync(this.configService.get('SERVER_CONFIG_PATH'))) {
        await this.configService.initServerConfig();
      }

      await fs.promises.appendFile(
        `${this.configService.get('SERVER_CONFIG_PATH')}/audit.log`,
        JSON.stringify(log) + '\n',
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
