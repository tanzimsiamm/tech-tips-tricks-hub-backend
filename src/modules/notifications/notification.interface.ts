import { Document, Types } from 'mongoose';
import { TUserProfileResponse } from '../users/user.interface';

export type TNotificationType = 'new_post' | 'comment' | 'follow' | 'payment_success' | 'admin_message';

export type TNotification = {
    // === REMOVE _ID FROM HERE ===
    // _id?: Types.ObjectId; // <--- REMOVE THIS LINE
    user: Types.ObjectId | TUserProfileResponse;
    sender?: Types.ObjectId | TUserProfileResponse;
    type: TNotificationType;
    message: string;
    link?: string;
    read?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface INotificationDocument extends TNotification, Document {}

export type TCreateNotificationPayload = Pick<TNotification, 'user' | 'sender' | 'type' | 'message' | 'link'>;