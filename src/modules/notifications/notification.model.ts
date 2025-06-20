import { Schema, model, Types } from "mongoose";
import { INotificationDocument, TNotificationType } from "./notification.interface";

const notificationSchema = new Schema<INotificationDocument>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User', // User who receives the notification
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false // Not all notifications have a specific sender (e.g., admin message)
    },
    type: {
        type: String,
        required: true,
        enum: ['new_post', 'comment', 'follow', 'payment_success', 'admin_message'] as TNotificationType[]
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export const Notification = model<INotificationDocument>('Notification', notificationSchema);