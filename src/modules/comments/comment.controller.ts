import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { commentServices } from './comment.service';
import { commentValidations } from './comment.validation';
import AppError from '../../errors/AppError';
import validateRequest from '../../middleware/validateRequest';
import { AuthenticatedRequest } from '../../middleware/auth';
import { TAddCommentPayload } from '../posts/post.interface';
import { Types } from 'mongoose';

const addComment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user!._id.toString();

    if (!Types.ObjectId.isValid(postId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Post ID format!');
    }

    const { error, value } = commentValidations.addCommentValidationSchema.safeParse(req.body);
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', '));
    }

    const result = await commentServices.addCommentToPost(postId, userId, value as TAddCommentPayload);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Comment added successfully!',
        data: result,
    });
});

const deleteComment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { postId, commentId } = req.params;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ID format for Post or Comment!');
    }

    const result = await commentServices.deleteCommentFromPost(postId, commentId, userId, userRole);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment deleted successfully!',
        data: result,
    });
});

const updateComment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { postId, commentId } = req.params;
    const userId = req.user!._id.toString();

    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid ID format for Post or Comment!');
    }

    const { error, value } = commentValidations.updateCommentValidationSchema.safeParse(req.body);
    if (error) {
        throw new AppError(httpStatus.BAD_REQUEST, error.errors.map(e => e.message).join(', '));
    }

    const result = await commentServices.updateCommentInPost(postId, commentId, userId, value.text);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Comment updated successfully!',
        data: result,
    });
});

export const commentControllers = {
    addComment,
    deleteComment,
    updateComment,
};