import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Survey Management API')
  .setDescription('API for managing surveys, questions, and responses')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

export const swaggerOptions: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};
