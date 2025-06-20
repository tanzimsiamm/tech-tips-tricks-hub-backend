import express from 'express';
import { postControllers } from './post.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { postValidations } from './post.validation';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

router.post(
    '/',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(postValidations.createPostValidationSchema),
    postControllers.createPost
);

router.get(
    '/',
    validateRequest(postValidations.getPostsQueryParamsSchema),
    postControllers.getAllPosts
);

router.get(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    postControllers.getSinglePost
);

router.put(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(postValidations.updatePostValidationSchema),
    postControllers.updatePost
);

router.delete(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    postControllers.deletePost
);

router.patch(
    '/:id/upvote',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    postControllers.upvotePost
);

router.patch(
    '/:id/downvote',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    postControllers.downvotePost
);

export default router;