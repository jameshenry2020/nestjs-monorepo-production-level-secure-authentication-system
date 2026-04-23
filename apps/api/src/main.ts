import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  const config = new DocumentBuilder()
    .setTitle('Secure Authentication API')
    .setDescription('The secure production grade api authentication service with jwt, oauth, access control with role and permission')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Users')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);
  await app.listen(3001);
}
bootstrap();
