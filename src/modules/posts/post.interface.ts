import { Document, Types } from 'mongoose';
import { TUserProfileResponse } from '../users/user.interface';

export type TComment = {
    _id?: Types.ObjectId;
    user: Types.ObjectId | TUserProfileResponse;
    text: string;
    createdAt?: Date;
};

export type TPost = {
    // _id is REMOVED from here. It will be provided by Mongoose's Document.
    user: Types.ObjectId | TUserProfileResponse;
    title: string;
    content: string;
    category: 'Web' | 'Software Engineering' | 'AI' | 'Mobile' | 'Cybersecurity' | 'Data Science' | 'Other';
    tags?: string[];
    isPremium?: boolean;
    upvotes?: number;
    downvotes?: number;
    comments?: TComment[];
    views?: number;
    images?: string[];
    createdAt?: Date;
    updatedAt?: Date;
};

export interface IPostDocument extends TPost, Document {}

export type TCreatePostPayload = Pick<TPost, 'title' | 'content' | 'category' | 'tags' | 'isPremium' | 'images'>;
export type TUpdatePostPayload = Partial<TCreatePostPayload>;
export type TAddCommentPayload = Pick<TComment, 'text'>;

export type TPostQueryParams = {
    category?: TPost['category'];
    searchTerm?: string;
    isPremium?: 'true' | 'false';
    limit?: string;
    page?: string;
    sort?: string;
    fields?: string;
};