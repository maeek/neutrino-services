import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  private readonly RMQ_QUEUES = {
    RABBITMQ_QUEUE: 'admin',
  };

  private readonly CONFIG_DEFAULTS = {
    SERVER_CONFIG_PATH: '/config',
    RABBITMQ_URL: 'amqp://test:test@rabbitmq:5671',
    RABBITMQ_SURVIVE_RESTART: false,
    ...this.RMQ_QUEUES,
  };

  constructor() {
    this.envConfig = {
      RABBITMQ_URL: this.getValueFromEnv('RABBITMQ_URL'),
      RABBITMQ_SURVIVE_RESTART: this.getValueFromEnv(
        'RABBITMQ_SURVIVE_RESTART',
      ),
      RABBITMQ_QUEUE: this.getValueFromEnv('RABBITMQ_QUEUE'),
      SERVER_CONFIG_PATH: this.getValueFromEnv('SERVER_CONFIG_PATH'),
    };

    this.getServerConfig();
  }

  private getValueFromEnv(key: string): any {
    return process.env[key] || this.CONFIG_DEFAULTS[key];
  }

  get(key: string): any {
    return this.envConfig[key] || process.env[key];
  }

  async initServerConfig() {
    await this.setServerConfig({
      registrationEnabled: false,
    });
  }

  async getServerConfig() {
    if (this.get('LOADED_CONFIG')) {
      return this.get('LOADED_CONFIG');
    }

    if (
      !fs.existsSync(this.get('SERVER_CONFIG_PATH')) ||
      !fs.existsSync(`${this.get('SERVER_CONFIG_PATH')}/config.json`)
    ) {
      console.log('init');
      await this.initServerConfig();
    }

    const config = await fs.promises.readFile(
      `${this.get('SERVER_CONFIG_PATH')}/config.json`,
      'utf-8',
    );
    const parsedConf = JSON.parse(config);
    this.envConfig.LOADED_CONFIG = parsedConf;

    return parsedConf;
  }

  async setServerConfig(config: any) {
    if (!fs.existsSync(this.get('SERVER_CONFIG_PATH'))) {
      await fs.promises.mkdir(this.get('SERVER_CONFIG_PATH'));
    }

    await fs.promises.writeFile(
      `${this.get('SERVER_CONFIG_PATH')}/config.json`,
      JSON.stringify(config),
    );
    this.envConfig.LOADED_CONFIG = config;

    return config;
  }

  async initAuditLogFile() {
    if (!fs.existsSync(this.get('SERVER_CONFIG_PATH'))) {
      await fs.promises.mkdir(this.get('SERVER_CONFIG_PATH'));
    }

    await fs.promises.writeFile(
      `${this.get('SERVER_CONFIG_PATH')}/audit.log`,
      '',
    );
  }
}
