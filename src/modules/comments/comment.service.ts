import { Post } from '../posts/post.model';
import { TAddCommentPayload, IPostDocument } from '../posts/post.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';

const addCommentToPost = async (postId: string, userId: string, payload: TAddCommentPayload): Promise<IPostDocument | null> => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
    }

    post.comments?.push({ user: new Types.ObjectId(userId), text: payload.text, createdAt: new Date() });
    await post.save();

    const updatedPost = await Post.findById(postId)
        .populate({ path: 'user', select: 'name email image role' })
        .populate({ path: 'comments.user', select: 'name email image' });

    return updatedPost;
};

const deleteCommentFromPost = async (postId: string, commentId: string, userId: string, userRole: string): Promise<IPostDocument | null> => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
    }

    const commentIndex = post.comments?.findIndex(c => c._id?.toString() === commentId);

    if (commentIndex === undefined || commentIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Comment not found!');
    }

    const commentToDelete = post.comments![commentIndex];

    if (commentToDelete.user instanceof Types.ObjectId && commentToDelete.user.toString() !== userId && userRole !== 'admin') {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this comment!');
    }

    post.comments?.splice(commentIndex, 1);
    await post.save();

    const updatedPost = await Post.findById(postId)
        .populate({ path: 'user', select: 'name email image role' })
        .populate({ path: 'comments.user', select: 'name email image' });

    return updatedPost;
};

const updateCommentInPost = async (postId: string, commentId: string, userId: string, newText: string): Promise<IPostDocument | null> => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
    }

    const comment = post.comments?.find(c => c._id?.toString() === commentId);
    if (!comment) {
        throw new AppError(httpStatus.NOT_FOUND, 'Comment not found!');
    }

    if (comment.user instanceof Types.ObjectId && comment.user.toString() !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this comment!');
    }

    comment.text = newText;
    await post.save();

    const updatedPost = await Post.findById(postId)
        .populate({ path: 'user', select: 'name email image role' })
        .populate({ path: 'comments.user', select: 'name email image' });

    return updatedPost;
};


export const commentServices = {
    addCommentToPost,
    deleteCommentFromPost,
    updateCommentInPost,
};