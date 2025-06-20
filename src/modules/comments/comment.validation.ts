import { z } from 'zod';
import { Types } from 'mongoose';
import { postValidations } from '../posts/post.validation';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

const updateCommentValidationSchema = z.object({
    text: z.string().min(1, 'Comment text cannot be empty'),
});

export const commentValidations = {
    addCommentValidationSchema: postValidations.addCommentValidationSchema,
    updateCommentValidationSchema,
    objectIdSchema
};