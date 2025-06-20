import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authServices } from './auth.service';
import { authValidations } from './auth.validation';
import AppError from '../../errors/AppError';
import validateRequest from '../../middleware/validateRequest'; // Import validateRequest

const register = catchAsync(async (req: Request, res: Response) => {
    // Validation now handled by validateRequest middleware
    // const { error, value } = authValidations.registerValidationSchema.safeParse(req.body);
    // if (error) { throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', ')); }

    const { user, token } = await authServices.registerUser(req.body); // Use req.body directly

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User registered successfully!',
        data: { user, token },
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    // Validation now handled by validateRequest middleware
    // const { error, value } = authValidations.loginValidationSchema.safeParse(req.body);
    // if (error) { throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', ')); }

    const { user, token } = await authServices.loginUser(req.body); // Use req.body directly

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User logged in successfully!',
        data: { user, token },
    });
});

export const authControllers = {
    register,
    login,
};