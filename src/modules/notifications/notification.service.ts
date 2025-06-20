import { Notification } from './notification.model';
import {
  TCreateNotificationPayload,
  INotificationDocument,
} from './notification.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createNotification = async (
  payload: TCreateNotificationPayload
): Promise<INotificationDocument> => {
  const notification = await Notification.create(payload);
  return notification;
};

const getNotificationsByUserId = async (
  userId: string,
  query: any
): Promise<INotificationDocument[]> => {
  const { read, limit, page } = query;
  const filter: Record<string, any> = { user: userId };

  if (read !== undefined) {
    filter.read = read === 'true';
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) || 10)
    .skip((parseInt(page) - 1 || 0) * (parseInt(limit) || 10));

  return notifications;
};

const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<INotificationDocument | null> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId, read: false },
    { read: true },
    { new: true }
  );

  if (!notification) {
    const existingNotification = await Notification.findById(notificationId);
    if (existingNotification && existingNotification.read) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Notification already marked as read!'
      );
    }
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification not found or not belonging to user!'
    );
  }
  return notification;
};

const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<INotificationDocument | null> => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
  if (!notification) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification not found or not belonging to user!'
    );
  }
  return notification;
};

export const notificationServices = {
  createNotification,
  getNotificationsByUserId,
  markNotificationAsRead,
  deleteNotification,
};
