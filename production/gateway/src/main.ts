import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './services/config/config.service';
import { Logger } from '@nestjs/common';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('API docs')
    .setVersion(process.env.BUILD_VER || '1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.use(compression());

  app.useLogger(Logger);

  const configService = new ConfigService();
  await app.listen(configService.get('API_PORT'));
}

bootstrap();
