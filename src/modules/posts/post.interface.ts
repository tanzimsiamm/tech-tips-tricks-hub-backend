import { Document, Types } from 'mongoose';
import { TUserProfileResponse } from '../users/user.interface';

export type TComment = {
    _id?: Types.ObjectId; // _id is fine here as it's not a top-level Document
    user: Types.ObjectId | TUserProfileResponse;
    text: string;
    createdAt?: Date;
};

export type TPost = {
    // === REMOVE _ID FROM HERE ===
    // _id?: Types.ObjectId; // <--- REMOVE THIS LINE
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

export interface IPostDocument extends TPost, Document {} // _id is implicitly inherited from Document

export type TCreatePostPayload = Pick<TPost, 'title' | 'content' | 'category' | 'tags' | 'isPremium' | 'images'>;
export type TUpdatePostPayload = Partial<TCreatePostPayload>;
export type TAddCommentPayload = Pick<TComment, 'text'>;

export type TPostQueryParams = {
    category?: TPost['category'];
    search?: string;
    isPremium?: 'true' | 'false';
    limit?: any;
    page?: any;
    sortBy?: 'createdAt' | 'views' | 'upvotes';
    sortOrder?: 'asc' | 'desc';
};