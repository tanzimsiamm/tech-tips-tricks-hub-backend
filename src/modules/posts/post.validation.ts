import { z } from 'zod';
import { Types } from 'mongoose';
import { TAddCommentPayload, TCreatePostPayload, TPostQueryParams, TUpdatePostPayload } from './post.interface';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

const postCategories = ['Web', 'Software Engineering', 'AI', 'Mobile', 'Cybersecurity', 'Data Science', 'Other'] as const;

const createPostValidationSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    content: z.string().min(1, 'Content is required'),
    category: z.enum(postCategories).default('Other'),
    tags: z.array(z.string()).optional(),
    isPremium: z.boolean().optional().default(false),
    images: z.array(z.string().url('Invalid image URL format')).optional(),
});

const updatePostValidationSchema = createPostValidationSchema.partial().strict();

const addCommentValidationSchema = z.object({
    text: z.string().min(1, 'Comment text cannot be empty').max(1000, 'Comment too long'),
});

const getPostsQueryParamsSchema = z.object({
    category: z.enum(postCategories).optional(),
    searchTerm: z.string().optional(),
    isPremium: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    limit: z.string().optional().default('10'),
    page: z.string().optional().default('1'),
    sort: z.string().optional().default('-createdAt'),
    fields: z.string().optional().default('-__v'),
}).partial();

export const postValidations = {
    createPostValidationSchema,
    updatePostValidationSchema,
    addCommentValidationSchema,
    getPostsQueryParamsSchema,
    objectIdSchema
};