import { z } from 'zod';
import { Types } from 'mongoose';
// Import addCommentValidationSchema from post.validation as it's defined there
import { postValidations } from '../posts/post.validation';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

const updateCommentValidationSchema = z.object({
    text: z.string().min(1, 'Comment text cannot be empty'),
});

export const commentValidations = {
    addCommentValidationSchema: postValidations.addCommentValidationSchema, // Re-use from post module
    updateCommentValidationSchema,
    objectIdSchema // For validating commentId in params
};