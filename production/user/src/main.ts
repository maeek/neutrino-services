import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from './services/config/config.service';

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.createMicroservice(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBITMQ_URL')],
      queue: configService.get('RABBITMQ_QUEUE'),
      persist: true,
      queueOptions: {
        durable: false,
      },
    },
  } as RmqOptions);

  await app.listen();
}
bootstrap();
