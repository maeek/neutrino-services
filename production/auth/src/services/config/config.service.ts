import { JwtModuleOptions } from '@nestjs/jwt';
import { Transport } from '@nestjs/microservices';
import { generateKeyPair } from 'crypto';
import * as fs from 'fs';

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
    JWT_PUBKEY: '/config/jwtRS256.key.pub',
    JWT_PRIVKEY: '/config/jwtRS256.key',
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
      JWT_PUBKEY: this.getValueFromEnv('JWT_PUBKEY'),
      JWT_PRIVKEY: this.getValueFromEnv('JWT_PRIVKEY'),
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

  async generateJwtKeys() {
    const { publicKey, privateKey } = await new Promise<{
      publicKey: string;
      privateKey: string;
    }>((resolve, reject) => {
      generateKeyPair(
        'rsa',
        {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        },
        (err, publicKey, privateKey) => {
          if (err) {
            return reject(err);
          }

          resolve({ publicKey, privateKey });
        },
      );
    });

    if (!fs.existsSync('/config')) {
      await fs.promises.mkdir('/config');
    }

    await fs.promises.writeFile(this.get('JWT_PUBKEY'), publicKey);
    await fs.promises.writeFile(this.get('JWT_PRIVKEY'), privateKey);
  }

  async getJwtOptions(): Promise<JwtModuleOptions> {
    if (
      !fs.existsSync(this.get('JWT_PUBKEY')) ||
      !fs.existsSync(this.get('JWT_PRIVKEY'))
    ) {
      await this.generateJwtKeys();
    }

    const publicKey = await fs.promises.readFile(this.get('JWT_PUBKEY'));
    const privateKey = await fs.promises.readFile(this.get('JWT_PRIVKEY'));

    return {
      publicKey,
      privateKey,
      signOptions: {
        issuer: this.getValueFromEnv('JWT_ISSUER') || 'chat.suchanecki.me',
        algorithm: 'RS256',
      },
      verifyOptions: {
        algorithms: ['RS256'],
        issuer: this.getValueFromEnv('JWT_ISSUER') || 'chat.suchanecki.me',
      },
    };
  }
}
