import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { paymentServices } from './payment.service';
import { paymentValidations } from './payment.validation';
import AppError from '../../errors/AppError';
import validateRequest from '../../middleware/validateRequest';
import { AuthenticatedRequest } from '../../middleware/auth';
import { TInitiatePaymentPayload, TPaymentWebhookPayload } from './payment.interface';

const initiatePayment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    // Validation handled by validateRequest middleware
    const userId = req.user!._id.toString();
    const userEmail = req.user!.email;

    const result = await paymentServices.initiateAamarpayPayment(userId, req.body as TInitiatePaymentPayload, userEmail);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Payment initiation successful!', data: result });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const { error, value } = paymentValidations.paymentWebhookValidationSchema.safeParse(req.body);
    if (error) {
        console.error('Webhook validation error:', error.errors);
        return sendResponse(res, { statusCode: httpStatus.OK, success: false, message: 'Webhook validation failed.', data: null });
    }

    const result = await paymentServices.handleAamarpayWebhook(value as TPaymentWebhookPayload);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: result.message, data: result.payment });
});

const getPaymentHistory = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await paymentServices.getPaymentHistory(userId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Payment history retrieved!', data: result });
});

export const paymentControllers = {
    initiatePayment,
    handleWebhook,
    getPaymentHistory,
};