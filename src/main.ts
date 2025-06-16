import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Important: importer d'abord ConfigService
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const configService = app.get(ConfigService); // Utiliser une variable avec un nom différent (minuscule)
  app.enableCors({
    origin: 'http://localhost:4200', // L'URL de votre frontend Angular
    methods: 'GET,POST,PUT,DELETE',
    credentials:true,
  });

  const config = new DocumentBuilder()
    .setTitle('SURVEY API')
    .setDescription('SURVEY API description')
    .setVersion('1.0')
    .addTag('SURVEY')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer', // <-- Remove the space after 'bearer'
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Entrez votre token JWT ici',
        in: 'header',
      },
      'access-token'
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory());

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

}
bootstrap();
