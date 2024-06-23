import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { Config } from './app.config';

export async function buildSwagger(app: INestApplication) {
  const cnfg = app.get(ConfigService<Config>);
  const appConfig = cnfg.getOrThrow<Config['app']>('app');

  const title = appConfig.name;

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription('API Documentation')
    .setVersion('latest')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerName: string, methodName: string) => {
      return methodName;
    },
  };

  const document = SwaggerModule.createDocument(app, config, options);

  const schemas = document?.components?.schemas;

  if (schemas) {
    schemas['BadRequestError'] = {
      type: 'object',
      properties: {
        property: {
          type: 'string',
          description: 'information which data was fail',
        },
        concerns: {
          type: 'string',
          description: 'data problem that was facing',
        },
      },
    };

    schemas['HttpException'] = {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          description: 'normal http status code that reflacted with our header',
        },
        message: {
          type: 'string',
          description: 'message from service',
        },
        errors: {
          type: 'object',
          description:
            '<b>maybe</b> contains error(s) detail description for spesifict error content(s) ex. bad request',
          oneOf: [
            {
              type: 'array',
              items: schemas['BadRequestError'],
            },
          ],
        },
      },
      required: ['statusCode', 'message'],
    };
  }

  SwaggerModule.setup('docs', app, document, {
    customCss: '.topbar { display: none !important; }',
    swaggerOptions: {
      docExpansion: 'none',
    },
    customfavIcon: '-',
  });
}
