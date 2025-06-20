import express from 'express';
import { notificationControllers } from './notification.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { notificationValidations } from './notification.validation';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

// Admin can create notifications (e.g., broadcast messages)
router.post('/', auth(USER_ROLES.ADMIN), validateRequest(notificationValidations.createNotificationValidationSchema), notificationControllers.createNotification);

// Get notifications for the authenticated user
router.get('/', auth(USER_ROLES.USER, USER_ROLES.ADMIN), notificationControllers.getMyNotifications);

// Mark a specific notification as read (uses ID from params, so no body validation for this route)
router.patch('/:id/read', auth(USER_ROLES.USER, USER_ROLES.ADMIN), notificationControllers.markNotificationRead);

// Delete a specific notification (uses ID from params, so no body validation for this route)
router.delete('/:id', auth(USER_ROLES.USER, USER_ROLES.ADMIN), notificationControllers.deleteNotification);

export default router;