import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { paymentServices } from './payment.service';
import { paymentValidations } from './payment.validation';
import { TInitiatePaymentPayload, TPaymentWebhookPayload } from './payment.interface';

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const userId = String(req.user!._id);
    const userEmail = req.user!.email;

    const result = await paymentServices.initiateAamarpayPayment(userId, req.body as TInitiatePaymentPayload, userEmail);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Payment initiation successful!', data: result });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const { success, data, error } = paymentValidations.paymentWebhookValidationSchema.safeParse(req.body);
    if (!success) {
        console.error('Webhook validation error:', error.errors);
        return sendResponse(res, { statusCode: httpStatus.OK, success: false, message: 'Webhook validation failed.', data: null });
    }

    const result = await paymentServices.handleAamarpayWebhook(data as TPaymentWebhookPayload);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: result.message, data: result.payment });
});

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const userId = String(req.user!._id);
    const result = await paymentServices.getPaymentHistory(userId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Payment history retrieved!', data: result });
});

export const paymentControllers = {
    initiatePayment,
    handleWebhook,
    getPaymentHistory,
};