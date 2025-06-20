import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { postServices } from './post.service';
import { postValidations } from './post.validation';
import AppError from '../../errors/AppError';
import validateRequest from '../../middleware/validateRequest';
import { AuthenticatedRequest } from '../../middleware/auth';
import { TAddCommentPayload, TCreatePostPayload, TPostQueryParams, TUpdatePostPayload } from './post.interface';
import { Types } from 'mongoose'; // For ObjectId validation

const createPost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    // Validation handled by validateRequest middleware
    const userId = req.user!._id.toString();
    const result = await postServices.createPost(userId, req.body as TCreatePostPayload); // Cast req.body

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Post created successfully!',
        data: result,
    });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    // Validate query parameters
    const { error, value } = postValidations.getPostsQueryParamsSchema.safeParse(req.query);
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', '));
    }

    const result = await postServices.getAllPosts(value as TPostQueryParams);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Posts retrieved successfully!',
        data: result,
        // You might add meta for pagination here
        meta: {
            page: value.page || 1,
            limit: value.limit || 10,
            total: await Post.countDocuments(value.category ? { category: value.category } : {}), // A more accurate total based on filter
        }
    });
});

const getSinglePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id?.toString(); // User might not be logged in for public posts
    const userRole = req.user?.role;

    // Validate Post ID
    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map(e => e.message).join(', '));
    }

    const result = await postServices.getSinglePost(id, userId, userRole);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post retrieved successfully!',
        data: result,
    });
});

const updatePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString(); // User must be logged in

    // Validate Post ID
    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map(e => e.message).join(', '));
    }

    // Validation handled by validateRequest middleware
    const result = await postServices.updatePost(id, userId, req.body as TUpdatePostPayload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post updated successfully!',
        data: result,
    });
});

const deletePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    // Validate Post ID
    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map(e => e.message).join(', '));
    }

    const result = await postServices.deletePost(id, userId, userRole);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post deleted successfully!',
        data: result,
    });
});

const upvotePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params; // Post ID
    const userId = req.user!._id.toString();

    // Validate Post ID
    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map(e => e.message).join(', '));
    }

    const result = await postServices.upvotePost(id, userId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Post upvoted!', data: result });
});

const downvotePost = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params; // Post ID
    const userId = req.user!._id.toString();

    // Validate Post ID
    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map(e => e.message).join(', '));
    }

    const result = await postServices.downvotePost(id, userId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Post downvoted!', data: result });
});


// Comment-related controllers: These calls will now go through commentControllers
// if you prefer to keep comment routes separate in comment.route.ts.
// If you want them integrated here (e.g. /posts/:id/comments), you can define them here
// and use commentServices directly.
// For now, I'll remove direct add/delete comment controllers from here to avoid duplication with comment module.

export const postControllers = {
    createPost,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    upvotePost,
    downvotePost,
    // Add/delete comments are now handled via comments module routes/controllers
};