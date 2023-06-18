import { Transport } from '@nestjs/microservices';

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  private readonly RMQ_QUEUES = {
    RABBITMQ_QUEUE: 'user',
    RABBITMQ_AUTH_QUEUE: 'auth',
    RABBITMQ_MESSAGE_QUEUE: 'websocket',
  };

  private readonly CONFIG_DEFAULTS = {
    RABBITMQ_URL: 'amqp://test:test@rabbitmq:5671',
    RABBITMQ_SURVIVE_RESTART: false,
    SALT_ROUNDS: 10,
    ADMIN_PASSWORD: 'P@ssw0rd',
    ...this.RMQ_QUEUES,
  };

  constructor() {
    this.envConfig = {
      RABBITMQ_URL: this.getValueFromEnv('RABBITMQ_URL'),
      RABBITMQ_SURVIVE_RESTART: this.getValueFromEnv(
        'RABBITMQ_SURVIVE_RESTART',
      ),
      RABBITMQ_QUEUE: this.getValueFromEnv('RABBITMQ_QUEUE'),
      SALT_ROUNDS: this.getValueFromEnv('SALT_ROUNDS'),
      ADMIN_PASSWORD: this.getValueFromEnv('ADMIN_PASSWORD'),
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
          'x-client-type': 'gateway',
        },
      },
      transport: Transport.RMQ,
    };

    this.envConfig.messageService = {
      options: {
        urls: [this.getValueFromEnv('RABBITMQ_URL')],
        queue: this.getValueFromEnv('RABBITMQ_MESSAGE_QUEUE'),
        noAck: false,
        queueOptions: {
          durable: this.getValueFromEnv('RABBITMQ_SURVIVE_RESTART'),
        },
        headers: {
          'x-client-type': 'gateway',
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
