import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { userControllers } from './user.controller';
import { userValidations } from './user.validation';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.USER), userControllers.getAllUsers);

router.get('/:email', auth(USER_ROLES.ADMIN, USER_ROLES.USER), userControllers.getSingleUser);

router.patch(
    '/follow',
    validateRequest(userValidations.followUnfollowValidationSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    userControllers.followUser,
);

router.patch(
    '/unfollow',
    validateRequest(userValidations.followUnfollowValidationSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    userControllers.unFollowUser,
);

router.put(
    '/:id',
    validateRequest(userValidations.updateUserValidationSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    userControllers.updateUser,
);

router.delete('/:id', auth(USER_ROLES.ADMIN), userControllers.deleteUser);

export default router;
