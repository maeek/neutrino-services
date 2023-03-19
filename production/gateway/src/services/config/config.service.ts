import { Transport } from '@nestjs/microservices';

export class ConfigService {
  readonly envConfig: { [key: string]: any } = null;

  private readonly RMQ_QUEUES = {
    RABBITMQ_ADMIN_QUEUE: 'admin',
    RABBITMQ_AUTH_QUEUE: 'auth',
    RABBITMQ_USER_QUEUE: 'user',
    RABBITMQ_WEBSOCKET_QUEUE: 'websocket',
  };

  private readonly CONFIG_DEFAULTS = {
    API_PORT: 8080,
    RABBITMQ_URL: 'amqp://test:test@rabbitmq:5671',
    RABBITMQ_SURVIVE_RESTART: false,
    ...this.RMQ_QUEUES,
  };

  constructor() {
    this.envConfig = {};
    this.envConfig.API_PORT = this.getValueFromEnv('API_PORT');

    this.envConfig.adminService = {
      options: {
        urls: [this.getValueFromEnv('RABBITMQ_URL')],
        queue: this.getValueFromEnv('RABBITMQ_ADMIN_QUEUE'),
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

    this.envConfig.websocketService = {
      options: {
        urls: [this.getValueFromEnv('RABBITMQ_URL')],
        queue: this.getValueFromEnv('RABBITMQ_WEBSOCKET_QUEUE'),
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

    this.envConfig.userService = {
      options: {
        urls: [this.getValueFromEnv('RABBITMQ_URL')],
        queue: this.getValueFromEnv('RABBITMQ_USER_QUEUE'),
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
