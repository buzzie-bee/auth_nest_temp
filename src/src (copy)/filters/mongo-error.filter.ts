import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    // const ctx = host.switchToHttp();
    // const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    switch (exception.code) {
      case 11000:
        // duplicate exception
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.statusCode = HttpStatus.FORBIDDEN;
        response.json({
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
          message: `Duplicate record found for unique key. Mongo Error: ${exception.message}`,
        });
    }
  }
}
