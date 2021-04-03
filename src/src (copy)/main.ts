import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rokkup')
    .setDescription('The Rokkup API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [AuthModule],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(5000);
}
bootstrap();
