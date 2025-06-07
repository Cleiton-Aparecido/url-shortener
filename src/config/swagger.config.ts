import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('link shortener API')
    .setDescription('Documentação da API para encurtar URLs')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token no formato: Bearer [token].',
      },
      'Authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();
  const darkStyle = theme.getBuffer(SwaggerThemeNameEnum.DARK);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: darkStyle,
    customSiteTitle: 'API Docs - Url Shortener',
  });
}
