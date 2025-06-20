import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { notificationServices } from './notification.service';
import { notificationValidations } from './notification.validation';
import AppError from '../../errors/AppError';
import validateRequest from '../../middleware/validateRequest';
import { AuthenticatedRequest } from '../../middleware/auth';
import { TCreateNotificationPayload } from './notification.interface';

const createNotification = catchAsync(async (req: Request<{}, {}, TCreateNotificationPayload>, res: Response) => {
    const { error, value } = notificationValidations.createNotificationValidationSchema.safeParse(req.body);
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', '));
    }
    const result = await notificationServices.createNotification(value);
    sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Notification created!', data: result });
});

const getMyNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await notificationServices.getNotificationsByUserId(userId, req.query);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Notifications retrieved!', data: result });
});

const markNotificationRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params; // Notification ID
    const userId = req.user!._id.toString();
    const { error } = notificationValidations.notificationIdParamSchema.safeParse({ id });
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', '));
    }

    const result = await notificationServices.markNotificationAsRead(id, userId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Notification marked as read!', data: result });
});

const deleteNotification = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params; // Notification ID
    const userId = req.user!._id.toString();
    const { error } = notificationValidations.notificationIdParamSchema.safeParse({ id });
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', '));
    }

    const result = await notificationServices.deleteNotification(id, userId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Notification deleted!', data: result });
});

export const notificationControllers = {
    createNotification,
    getMyNotifications,
    markNotificationRead,
    deleteNotification,
};