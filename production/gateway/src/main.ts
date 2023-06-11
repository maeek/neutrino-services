import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './services/config/config.service';
// import { Logger } from '@nestjs/common';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Chat API Docs')
    .setVersion(process.env.BUILD_VER || '1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document, {
    useGlobalPrefix: false,
  });

  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.use(compression());
  app.use(cookieParser());

  const configService = new ConfigService();
  await app.listen(configService.get('API_PORT'));
}

bootstrap();
