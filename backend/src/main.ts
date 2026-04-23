import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Filter (Requirement #8)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Serialization (Requirement: Secondary Safety Net)
  // WARNING: This interceptor only works on class instances.
  // It is NOT the primary security layer. Primary protection is sanitizeUser + DTO enforcement.
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableImplicitConversion: true,
    }),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 8000;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  await app.listen(port);
  logger.log(`🚀 NestJS Backend running on port ${port}`);
  logger.log(`Environment: ${nodeEnv}`);
}
bootstrap();
