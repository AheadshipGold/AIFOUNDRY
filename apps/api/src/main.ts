import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  // Structured logging
  app.useLogger(app.get(Logger));

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: '*', // TODO: configure for production
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT') || 3001;
  
  await app.listen(port);
  console.log(`Backend Foundation V3 is running on port ${port}`);
}
bootstrap();
