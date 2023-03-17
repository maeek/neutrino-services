import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io';
import { ConfigService } from './services/config/config.service';

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
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
  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);
  app.useLogger(Logger);
  await app.startAllMicroservices();
  await app.listen(configService.get('API_PORT'));
}
bootstrap();
