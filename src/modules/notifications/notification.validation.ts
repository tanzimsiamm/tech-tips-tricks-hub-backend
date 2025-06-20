import { z } from 'zod';
import { TNotificationType, TCreateNotificationPayload } from './notification.interface';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

const notificationTypes: TNotificationType[] = ['new_post', 'comment', 'follow', 'payment_success', 'admin_message'];

const createNotificationValidationSchema = z.object({
    user: objectIdSchema,
    sender: objectIdSchema.optional(),
    type: z.enum(notificationTypes),
    message: z.string().min(1, 'Notification message cannot be empty'),
    link: z.string().url('Invalid link format').optional(),
});

// For validation of ID parameters
const notificationIdParamSchema = z.object({
    id: objectIdSchema,
});

export const notificationValidations = {
    createNotificationValidationSchema,
    notificationIdParamSchema,
};