export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  private readonly RMQ_QUEUES = {
    RABBITMQ_QUEUE: 'auth',
  };

  private readonly CONFIG_DEFAULTS = {
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
    };
  }

  private getValueFromEnv(key: string): any {
    return process.env[key] || this.CONFIG_DEFAULTS[key];
  }

  get(key: string): any {
    return this.envConfig[key] || process.env[key];
  }
}
