import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Response } from 'express';
import { AppModule } from './app.module';
import { ConfigService } from './services/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('API docs')
    .setVersion(process.env.BUILD_VER || '1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.use((_req, res: Response, next) => {
    res.removeHeader('X-Powered-By');
    next();
  });
  app.use(helmet());
  const configService = new ConfigService();

  console.log(configService);

  await app.listen(configService.get('API_PORT'));
}

bootstrap();
