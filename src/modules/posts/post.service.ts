import { Post } from './post.model';
import { TCreatePostPayload, TUpdatePostPayload, TAddCommentPayload, IPostDocument, TPostQueryParams } from './post.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { User } from '../users/user.model'; // To check user membership for premium content
import { notificationServices } from '../notifications/notification.service'; // To create notifications (e.g., new post)

const createPost = async (userId: string, payload: TCreatePostPayload): Promise<IPostDocument> => {
    const post = await Post.create({ ...payload, user: new Types.ObjectId(userId) }); // Assign user ID

    // Optional: Create notification for followers (this would be more complex, involving fetching followers)
    // For now, let's just log a dummy notification creation
    // console.log(`Notification for new post by ${userId}: ${post.title}`);
    // await notificationServices.createNotification({
    //     user: new Types.ObjectId(userId), // This should be a follower's ID
    //     type: 'new_post',
    //     message: `New post "${post.title}" by ${user.name}!`, // Need user name here
    //     link: `/posts/${post._id}`,
    // });

    return post;
};

const getAllPosts = async (query: TPostQueryParams): Promise<IPostDocument[]> => {
    const { category, search, isPremium, limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    let filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search }; // Use text search

    // Only show premium posts if explicitly requested and allowed (or if user is admin)
    // For now, just filter by isPremium if specified in query
    if (isPremium !== undefined) {
        filter.isPremium = isPremium;
    }

    const sort: Record<string, any> = {};
    if (sortBy) {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const posts = await Post.find(filter)
        .populate({ path: 'user', select: 'name email image role' }) // Populate author details
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(); // Return plain JS objects

    return posts;
};

const getSinglePost = async (postId: string, userId?: string, userRole?: string): Promise<IPostDocument | null> => {
    const post = await Post.findById(postId)
        .populate({ path: 'user', select: 'name email image role' })
        .populate({ path: 'comments.user', select: 'name email image' }); // Populate comment authors

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
    }

    // Increment view count if not the author and if user is logged in (optional: track unique views)
    if (userId && post.user instanceof Types.ObjectId && post.user.toString() !== userId) {
        post.views = (post.views || 0) + 1;
        await post.save(); // Save the updated view count
    }

    // Premium content access check
    if (post.isPremium) {
        if (!userId) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'Please log in to view premium content.');
        }
        if (userRole !== 'admin') {
            const user = await User.findById(userId);
            if (!user || !user.memberShip || new Date(user.memberShip.exp) < new Date()) {
                throw new AppError(httpStatus.FORBIDDEN, 'This is a premium post. Please subscribe to view.');
            }
        }
    }

    return post;
};


const updatePost = async (postId: string, userId: string, payload: TUpdatePostPayload): Promise<IPostDocument | null> => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
    }

    // Ensure the user updating is the author
    if (post.user instanceof Types.ObjectId && post.user.toString() !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this post!');
    }

    // Perform the update
    const updatedPost = await Post.findByIdAndUpdate(postId, payload, { new: true, runValidators: true });
    return updatedPost;
};

const deletePost = async (postId: string, userId: string, userRole: string): Promise<IPostDocument | null> => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
    }

    // Only author or admin can delete
    if (post.user instanceof Types.ObjectId && post.user.toString() !== userId && userRole !== 'admin') {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this post!');
    }

    const deletedPost = await Post.findByIdAndDelete(postId);
    return deletedPost;
};

const handleVote = async (postId: string, userId: string, type: 'upvote' | 'downvote'): Promise<IPostDocument | null> => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
    }

    // Basic voting logic: increment/decrement
    // For a more robust system:
    // 1. Store user IDs who voted in arrays (e.g., `upvotedBy: Types.ObjectId[]`, `downvotedBy: Types.ObjectId[]`)
    // 2. Prevent user from voting multiple times or upvoting after downvoting and vice-versa
    // 3. Use $addToSet and $pull operators for atomicity.

    if (type === 'upvote') {
        post.upvotes = (post.upvotes || 0) + 1;
        // If the user previously downvoted, remove their downvote
        if (post.downvotes && post.downvotes > 0) {
            post.downvotes -= 1;
        }
    } else { // downvote
        post.downvotes = (post.downvotes || 0) + 1;
        // If the user previously upvoted, remove their upvote
        if (post.upvotes && post.upvotes > 0) {
            post.upvotes -= 1;
        }
    }

    await post.save();
    return post;
};

// Comment-related services are often in the comments module, but since comments are embedded,
// they are commonly managed here or via specific comment services that call the Post model.
// As per your comment module's service, I'll remove them from here to avoid duplication.
// The comment module's service already handles interaction with the Post model.


export const postServices = {
    createPost,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    upvotePost: (postId: string, userId: string) => handleVote(postId, userId, 'upvote'),
    downvotePost: (postId: string, userId: string) => handleVote(postId, userId, 'downvote'),
    // addComment and deleteComment logic is in comment.service.ts
};