import { Post } from '../posts/post.model';
import { TAddCommentPayload, IPostDocument } from '../posts/post.interface'; // From Post module interface
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

    // Fetch and populate the post again to return a consistent response
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

    // Find the index of the comment to delete
    const commentIndex = post.comments?.findIndex(c => c._id?.toString() === commentId);

    if (commentIndex === undefined || commentIndex === -1) {
        throw new AppError(httpStatus.NOT_FOUND, 'Comment not found!');
    }

    const commentToDelete = post.comments![commentIndex];

    // Authorization: Only the comment author or an admin can delete
    if (commentToDelete.user instanceof Types.ObjectId && commentToDelete.user.toString() !== userId && userRole !== 'admin') {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this comment!');
    }

    // Remove the comment from the array
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

    // Authorization: Only the comment author can update
    if (comment.user instanceof Types.ObjectId && comment.user.toString() !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this comment!');
    }

    comment.text = newText;
    await post.save(); // Mongoose will save changes to subdocuments

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