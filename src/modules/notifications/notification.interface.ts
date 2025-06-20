import { Document, Types } from 'mongoose';
import { TUserProfileResponse } from '../users/user.interface';

export type TNotificationType = 'new_post' | 'comment' | 'follow' | 'payment_success' | 'admin_message';

export type TNotification = {
    // FIX APPLIED HERE: _id is REMOVED from the base TNotification type.
    // It will be implicitly provided by the Document interface in INotificationDocument.
    user: Types.ObjectId | TUserProfileResponse; // This is for the model/document/populated response
    sender?: Types.ObjectId | TUserProfileResponse; // This is for the model/document/populated response
    type: TNotificationType;
    message: string;
    link?: string;
    read?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

// INotificationDocument now correctly extends TNotification and Document.
// _id: Types.ObjectId is implicitly provided by the Document interface.
export interface INotificationDocument extends TNotification, Document {}

// Request Payloads (remain unchanged)
export type TCreateNotificationPayload = {
    user: Types.ObjectId | string; // Accept both ObjectId and string
    sender?: Types.ObjectId | string;
    type: TNotificationType;
    message: string;
    link?: string;
};