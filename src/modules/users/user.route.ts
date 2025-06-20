import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { userControllers } from './user.controller';
import { userValidations } from './user.validation'; // Import userValidations
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

// Get all users (Admin & User roles can access)
router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.USER), userControllers.getAllUsers);

// Get single user by email (using :email param)
router.get('/:email', auth(USER_ROLES.ADMIN, USER_ROLES.USER), userControllers.getSingleUser);

// Follow another user (Requires validation for payload)
router.patch(
    '/follow',
    validateRequest(userValidations.followUnfollowValidationSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    userControllers.followUser,
);

// UnFollow the user (Requires validation for payload)
router.patch(
    '/unfollow',
    validateRequest(userValidations.followUnfollowValidationSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    userControllers.unFollowUser,
);

// Update user by ID (User can update self, Admin can update anyone)
router.put(
    '/:id',
    validateRequest(userValidations.updateUserValidationSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    userControllers.updateUser,
);

// Delete user by ID (Admin only)
router.delete('/:id', auth(USER_ROLES.ADMIN), userControllers.deleteUser);

export default router; // Changed from export const UserRoutes to default export
