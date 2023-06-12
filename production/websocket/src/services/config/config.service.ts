import { Transport } from '@nestjs/microservices';

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  private readonly RMQ_QUEUES = {
    RABBITMQ_QUEUE: 'websocket',
    RABBITMQ_USER_QUEUE: 'user',
    RABBITMQ_AUTH_QUEUE: 'auth',
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

    this.envConfig.userService = {
      options: {
        urls: [this.getValueFromEnv('RABBITMQ_URL')],
        queue: this.getValueFromEnv('RABBITMQ_USER_QUEUE'),
        noAck: false,
        queueOptions: {
          durable: this.getValueFromEnv('RABBITMQ_SURVIVE_RESTART'),
        },
        headers: {
          'x-client-type': 'websocket',
        },
      },
      transport: Transport.RMQ,
    };

    this.envConfig.authService = {
      options: {
        urls: [this.getValueFromEnv('RABBITMQ_URL')],
        queue: this.getValueFromEnv('RABBITMQ_AUTH_QUEUE'),
        noAck: false,
        queueOptions: {
          durable: this.getValueFromEnv('RABBITMQ_SURVIVE_RESTART'),
        },
        headers: {
          'x-client-type': 'websocket',
        },
      },
      transport: Transport.RMQ,
    };
  }

  private getValueFromEnv(key: string): any {
    return process.env[key] || this.CONFIG_DEFAULTS[key];
  }

  get(key: string): any {
    return this.envConfig[key] || process.env[key];
  }
}
