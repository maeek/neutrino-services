import { Transport } from '@nestjs/microservices';

export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  private readonly RMQ_QUEUES = {
    RABBITMQ_QUEUE: 'auth',
    RABBITMQ_USER_QUEUE: 'user',
  };

  private readonly CONFIG_DEFAULTS = {
    RABBITMQ_URL: 'amqp://test:test@rabbitmq:5671',
    RABBITMQ_SURVIVE_RESTART: false,
    WEBAUTHN_RPID: 'chat.suchanecki.me',
    WEBAUTHN_ORIGIN: 'https://chat.suchanecki.me',
    WEBAUTHN_RPNAME: 'Chat',
    REDIS_HOST: 'redis',
    REDIS_PORT: 6379,
    ...this.RMQ_QUEUES,
  };

  constructor() {
    this.envConfig = {
      RABBITMQ_URL: this.getValueFromEnv('RABBITMQ_URL'),
      RABBITMQ_SURVIVE_RESTART: this.getValueFromEnv(
        'RABBITMQ_SURVIVE_RESTART',
      ),
      RABBITMQ_QUEUE: this.getValueFromEnv('RABBITMQ_QUEUE'),
      WEBAUTHN_RPNAME: this.getValueFromEnv('WEBAUTHN_RPNAME'),
      WEBAUTHN_RPID: this.getValueFromEnv('WEBAUTHN_RPID'),
      WEBAUTHN_ORIGIN: this.getValueFromEnv('WEBAUTHN_ORIGIN'),
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
  }

  private getValueFromEnv(key: string): any {
    return process.env[key] || this.CONFIG_DEFAULTS[key];
  }

  get(key: string): any {
    return this.envConfig[key] || process.env[key];
  }
}
