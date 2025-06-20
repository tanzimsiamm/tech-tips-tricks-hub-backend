import { z } from 'zod';
import { Types } from 'mongoose';
import { TNotificationType } from './notification.interface';

const objectIdSchema = z.string().transform((val, ctx) => {
  if (!Types.ObjectId.isValid(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid ObjectId format",
    });
    return z.NEVER;
  }
  return new Types.ObjectId(val);
});

const notificationTypes = ['new_post', 'comment', 'follow', 'payment_success', 'admin_message'] as const;

export const createNotificationValidationSchema = z.object({
  user: objectIdSchema,
  sender: objectIdSchema.optional(),
  type: z.enum(notificationTypes),
  message: z.string().min(1),
  link: z.string().url().optional(),
});

export const notificationIdParamSchema = z.object({
  id: objectIdSchema,
});

// Explicitly export all validations
export const notificationValidations = {
  createNotificationValidationSchema,
  notificationIdParamSchema,
};