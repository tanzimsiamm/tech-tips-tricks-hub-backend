import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authServices } from './auth.service';
import { TLoginPayload, TRegisterPayload } from './auth.interface';

const register = catchAsync(async (req: Request<{}, {}, TRegisterPayload>, res: Response) => {
    const { user, token } = await authServices.registerUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User registered successfully!',
        data: { user, token },
    });
});

const login = catchAsync(async (req: Request<{}, {}, TLoginPayload>, res: Response) => {
    const { user, token } = await authServices.loginUser(req.body);

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