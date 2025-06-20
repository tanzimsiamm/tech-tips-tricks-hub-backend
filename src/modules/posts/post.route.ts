import express from 'express';
import { postControllers } from './post.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { postValidations } from './post.validation';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

// Create a new post
router.post(
    '/',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN), // Only logged-in users/admins can create posts
    validateRequest(postValidations.createPostValidationSchema),
    postControllers.createPost
);

// Get all posts (publicly accessible, premium content handled in service)
router.get(
    '/',
    validateRequest(postValidations.getPostsQueryParamsSchema), // Validate query params
    postControllers.getAllPosts
);

// Get a single post by ID (protected to handle premium content access)
router.get(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN), // User must be authenticated to check premium access
    postControllers.getSinglePost
);

// Update a post by ID (only author or admin)
router.put(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(postValidations.updatePostValidationSchema),
    postControllers.updatePost
);

// Delete a post by ID (only author or admin)
router.delete(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    postControllers.deletePost
);

// Upvote a post
router.patch(
    '/:id/upvote',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    postControllers.upvotePost
);

// Downvote a post
router.patch(
    '/:id/downvote',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    postControllers.downvotePost
);

// Comment routes are now handled in the comments module (e.g., /api/comments/:postId/add)
// So, you don't need these lines here.

export default router;