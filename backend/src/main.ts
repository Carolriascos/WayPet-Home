
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

<<<<<<< HEAD
  app.enableCors({ origin: process.env.FRONTEND_URL });

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
=======
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
>>>>>>> 94513ef70a156baf2eb34a3d94f6b7f64dcc9e2f
}

bootstrap();
