import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { notificationServices } from './notification.service';
import { notificationValidations } from './notification.validation';
import AppError from '../../errors/AppError';
import { TCreateNotificationPayload } from './notification.interface';

const createNotification = catchAsync(
    async (req: Request<{}, {}, TCreateNotificationPayload>, res: Response) => {
        const { success, data, error } =
            notificationValidations.createNotificationValidationSchema.safeParse(req.body);
        if (!success) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                error.errors.map((e) => e.message).join(', '),
            );
        }
        const result = await notificationServices.createNotification(data);
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Notification created!',
            data: result,
        });
    },
);

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
    const userId = String(req.user!._id);
    const result = await notificationServices.getNotificationsByUserId(userId, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Notifications retrieved!',
        data: result,
    });
});

const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = String(req.user!._id);
    const { error } = notificationValidations.notificationIdParamSchema.safeParse({ id });
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map((e) => e.message).join(', '));
    }

    const result = await notificationServices.markNotificationAsRead(id, userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Notification marked as read!',
        data: result,
    });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = String(req.user!._id);
    const { error } = notificationValidations.notificationIdParamSchema.safeParse({ id });
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map((e) => e.message).join(', '));
    }

    const result = await notificationServices.deleteNotification(id, userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Notification deleted!',
        data: result,
    });
});

export const notificationControllers = {
    createNotification,
    getMyNotifications,
    markNotificationRead,
    deleteNotification,
};
