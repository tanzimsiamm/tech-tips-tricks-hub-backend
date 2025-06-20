import express from 'express';
import { commentControllers } from './comment.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { commentValidations } from './comment.validation';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

router.post(
    '/:postId/add',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(commentValidations.addCommentValidationSchema),
    commentControllers.addComment,
);

router.patch(
    '/:postId/update/:commentId',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(commentValidations.updateCommentValidationSchema),
    commentControllers.updateComment,
);

router.delete(
    '/:postId/delete/:commentId',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    commentControllers.deleteComment,
);

export default router;
