// backend/src/modules/posts/post.service.ts
import { Post } from './post.model';
import {
  TCreatePostPayload,
  TUpdatePostPayload,
  IPostDocument,
  TPostQueryParams,
} from './post.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { User } from '../users/user.model';
import QueryBuilder from '../../utils/QueryBuilder';

// FIX: userId is already a string, pass it directly.
const createPost = async (
  userId: string,
  payload: TCreatePostPayload
): Promise<IPostDocument> => {
  const post = await Post.create({ ...payload, user: userId }); // Pass userId directly
  return post;
};

const getAllPosts = async (
  query: TPostQueryParams
): Promise<{
  posts: IPostDocument[];
  total: number;
  page: number;
  limit: number;
}> => {
  const postQuery = new QueryBuilder(Post.find(), query)
    .search(['title', 'content', 'category'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const posts = await postQuery.modelQuery.populate({
    path: 'user',
    select: 'name email image role',
  });

  const totalPosts = await postQuery.countTotal();

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return {
    posts: posts,
    total: totalPosts,
    page: page,
    limit: limit,
  };
};

const getSinglePost = async (
  postId: string,
  userId?: string,
  userRole?: string
): Promise<IPostDocument | null> => {
  const post = await Post.findById(postId)
    .populate({ path: 'user', select: 'name email image role' })
    .populate({ path: 'comments.user', select: 'name email image' });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
  }

  if (
    userId &&
    post.user instanceof Types.ObjectId &&
    post.user.toString() !== userId
  ) {
    post.views = (post.views || 0) + 1;
    await post.save();
  }

  if (post.isPremium) {
    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Please log in to view premium content.'
      );
    }
    if (userRole !== 'admin') {
      const user = await User.findById(userId);
      if (!user || !user.memberShip || user.memberShip.exp < new Date()) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'This is a premium post. Please subscribe to view.'
        );
      }
    }
  }

  return post;
};

const updatePost = async (
  postId: string,
  userId: string,
  payload: TUpdatePostPayload
): Promise<IPostDocument | null> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
  }
  if (post.user instanceof Types.ObjectId && post.user.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this post!'
    );
  }
  const updatedPost = await Post.findByIdAndUpdate(postId, payload, {
    new: true,
    runValidators: true,
  });
  return updatedPost;
};

const deletePost = async (
  postId: string,
  userId: string,
  userRole: string
): Promise<IPostDocument | null> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
  }
  if (
    post.user instanceof Types.ObjectId &&
    post.user.toString() !== userId &&
    userRole !== 'admin'
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this post!'
    );
  }
  const deletedPost = await Post.findByIdAndDelete(postId);
  return deletedPost;
};

const handleVote = async (
  postId: string,
  userId: string,
  type: 'upvote' | 'downvote'
): Promise<IPostDocument | null> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
  }

  if (type === 'upvote') {
    post.upvotes = (post.upvotes || 0) + 1;
    if (post.downvotes && post.downvotes > 0) {
      post.downvotes -= 1;
    }
  } else {
    // downvote
    post.downvotes = (post.downvotes || 0) + 1;
    if (post.upvotes && post.upvotes > 0) {
      post.upvotes -= 1;
    }
  }

  await post.save();
  return post;
};

export const postServices = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  upvotePost: (postId: string, userId: string) =>
    handleVote(postId, userId, 'upvote'),
  downvotePost: (postId: string, userId: string) =>
    handleVote(postId, userId, 'downvote'),
};
