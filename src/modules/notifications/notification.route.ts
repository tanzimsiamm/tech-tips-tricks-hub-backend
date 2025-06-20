import express from 'express';
import { notificationControllers } from './notification.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { notificationValidations } from './notification.validation';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

router.post(
    '/',
    auth(USER_ROLES.ADMIN),
    validateRequest(notificationValidations.createNotificationValidationSchema),
    notificationControllers.createNotification,
);

router.get(
    '/',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    notificationControllers.getMyNotifications,
);

router.patch(
    '/:id/read',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    notificationControllers.markNotificationRead,
);

router.delete(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    notificationControllers.deleteNotification,
);

export default router;
