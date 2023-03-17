export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  private readonly RMQ_QUEUES = {
    RABBITMQ_QUEUE: 'websocket',
  };

  private readonly CONFIG_DEFAULTS = {
    API_PORT: 8081,
    RABBITMQ_URL: 'amqp://test:test@rabbitmq:5671',
    RABBITMQ_SURVIVE_RESTART: false,
    REDIS_HOST: 'redis',
    REDIS_PORT: 6379,
    ...this.RMQ_QUEUES,
  };

  constructor() {
    this.envConfig = {
      API_PORT: this.getValueFromEnv('API_PORT'),
      RABBITMQ_URL: this.getValueFromEnv('RABBITMQ_URL'),
      RABBITMQ_SURVIVE_RESTART: this.getValueFromEnv(
        'RABBITMQ_SURVIVE_RESTART',
      ),
      RABBITMQ_QUEUE: this.getValueFromEnv('RABBITMQ_QUEUE'),
      REDIS_HOST: this.getValueFromEnv('REDIS_HOST'),
      REDIS_PORT: this.getValueFromEnv('REDIS_PORT'),
    };
  }

  private getValueFromEnv(key: string): any {
    return process.env[key] || this.CONFIG_DEFAULTS[key];
  }

  get(key: string): any {
    return this.envConfig[key] || process.env[key];
  }
}
