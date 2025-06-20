import { Request, Response } from 'express'; // Standard Request
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { postServices } from './post.service';
import { postValidations } from './post.validation';
import AppError from '../../errors/AppError';
import { TPostQueryParams, TCreatePostPayload, TUpdatePostPayload } from './post.interface';

const createPost = catchAsync(async (req: Request, res: Response) => {
    // req.user is guaranteed to be TUserProfileResponse here
    if (!req.user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }
    const userId = req.user._id; // Directly access _id, it's already a string from TUserProfileResponse
    const result = await postServices.createPost(String(userId), req.body as TCreatePostPayload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Post created successfully!',
        data: result,
    });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    // This route can be public
    const parsedQueryParams = postValidations.getPostsQueryParamsSchema.safeParse(req.query);

    if (!parsedQueryParams.success) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            parsedQueryParams.error.errors.map((e) => e.message).join(', '),
        );
    }

    const queryParams: TPostQueryParams = {
        ...parsedQueryParams.data,
        // Ensure isPremium matches TPostQueryParams if it's 'true' | 'false' | undefined
        isPremium:
            parsedQueryParams.data.isPremium === true
                ? 'true'
                : parsedQueryParams.data.isPremium === false
                  ? 'false'
                  : undefined,
    };

    const { posts, total, page, limit } = await postServices.getAllPosts(queryParams);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Posts retrieved successfully!',
        data: posts,
        meta: {
            page: page,
            limit: limit,
            total: total,
        },
    });
});

// All other controllers are protected routes, so Request is appropriate.
// The `String()` cast is removed as req.user._id is already a string.

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id; // Still optional here because this route might be public, or the user is not logged in to view *public* premium content.
    const userRole = req.user?.role; // Access directly, it's string

    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map((e) => e.message).join(', '));
    }

    const result = await postServices.getSinglePost(
        id,
        userId ? String(userId) : undefined,
        userRole,
    ); // userId needs to be string | undefined

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post retrieved successfully!',
        data: result,
    });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }
    const userId = String(req.user._id); // Ensure string

    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map((e) => e.message).join(', '));
    }

    const result = await postServices.updatePost(id, userId, req.body as TUpdatePostPayload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post updated successfully!',
        data: result,
    });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }
    const userId = String(req.user._id); // Ensure string
    const userRole = req.user.role; // Already string

    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map((e) => e.message).join(', '));
    }

    const result = await postServices.deletePost(id, userId, userRole);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post deleted successfully!',
        data: result,
    });
});

const upvotePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }
    const userId = String(req.user._id); // Ensure string

    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map((e) => e.message).join(', '));
    }

    const result = await postServices.upvotePost(id, userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post upvoted!',
        data: result,
    });
});

const downvotePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!req.user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
    }
    const userId = String(req.user._id); // Ensure string

    const { error: idError } = postValidations.objectIdSchema.safeParse(id);
    if (idError) {
        throw new AppError(httpStatus.BAD_REQUEST, idError.errors.map((e) => e.message).join(', '));
    }

    const result = await postServices.downvotePost(id, userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post downvoted!',
        data: result,
    });
});

export const postControllers = {
    createPost,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    upvotePost,
    downvotePost,
};
