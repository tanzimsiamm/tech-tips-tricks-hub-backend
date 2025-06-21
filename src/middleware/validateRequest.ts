import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

// Define a type for the validation location
type ValidationLocation = 'body' | 'query' | 'params';

const validateRequest = (schema: AnyZodObject, location: ValidationLocation = 'body') => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let dataToValidate: any;

    switch (location) {
      case 'body':
        dataToValidate = req.body;
        break;
      case 'query':
        dataToValidate = req.query;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      default:
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Invalid validation location specified.');
    }

    try {
      await schema.parseAsync(dataToValidate);
      next(); // If validation passes, proceed to the next middleware/controller
    } catch (error: any) {
      // Re-throw Zod errors as AppError for globalErrorHandler to catch
      throw new AppError(httpStatus.BAD_REQUEST, error.errors.map((e: any) => e.message).join(', '));
    }
  });
};

export default validateRequest;