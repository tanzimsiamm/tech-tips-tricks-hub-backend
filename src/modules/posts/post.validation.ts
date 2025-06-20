import { z } from 'zod';
import { Types } from 'mongoose'; // For ObjectId validation
import { TAddCommentPayload, TCreatePostPayload, TPostQueryParams, TUpdatePostPayload } from './post.interface';

// Helper schema for ObjectId validation
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

// Enum for categories to ensure consistency
const postCategories = ['Web', 'Software Engineering', 'AI', 'Mobile', 'Cybersecurity', 'Data Science', 'Other'] as const;

// Zod schema for creating a new post
const createPostValidationSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    content: z.string().min(1, 'Content is required'),
    category: z.enum(postCategories).default('Other'), // Enforce predefined categories
    tags: z.array(z.string()).optional(), // Array of strings for tags
    isPremium: z.boolean().optional().default(false), // Boolean for premium content
    images: z.array(z.string().url('Invalid image URL format')).optional(), // Array of image URLs
});

// Zod schema for updating an existing post (all fields are optional)
const updatePostValidationSchema = createPostValidationSchema.partial().strict(); // partial() makes all fields optional, strict() disallows unknown fields

// Zod schema for adding a comment
const addCommentValidationSchema = z.object({
    text: z.string().min(1, 'Comment text cannot be empty').max(1000, 'Comment too long'),
});

// Zod schema for post query parameters (for getAllPosts)
const getPostsQueryParamsSchema = z.object({
    category: z.enum(postCategories).optional(),
    search: z.string().optional(),
    isPremium: z.enum(['true', 'false']).optional().transform(val => val === 'true'), // Convert string to boolean
    limit: z.string().optional().transform(val => parseInt(val || '10')).refine(val => val > 0, { message: "Limit must be a positive number" }),
    page: z.string().optional().transform(val => parseInt(val || '1')).refine(val => val > 0, { message: "Page must be a positive number" }),
    sortBy: z.enum(['createdAt', 'views', 'upvotes']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).partial(); // All query params are optional

export const postValidations = {
    createPostValidationSchema,
    updatePostValidationSchema,
    addCommentValidationSchema,
    getPostsQueryParamsSchema,
    objectIdSchema // Re-export for route parameter validation
};