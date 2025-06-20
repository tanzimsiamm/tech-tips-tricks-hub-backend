import { z } from "zod";
import { Types } from 'mongoose';
import { TMembership } from "./user.interface";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

const membershipSchema: z.ZodType<TMembership> = z.object({
  takenDate: z.string().datetime(),
  exp: z.string().datetime(),
  package: z.object({
    name: z.string(),
    price: z.number(),
  }),
});

const createUserValidationSchema = z.object({
    name : z.string().min(1, 'Name is required'),
    email : z.string().email('Invalid email format'),
    role : z.enum(['user','admin']).default('user'),
    password : z.string().min(1, 'Password is required'),
    image : z.string().url('Invalid image URL').min(1, 'Image URL is required'),
    coverImg : z.string().url('Invalid cover image URL').optional(),
    memberShip : membershipSchema.nullable().optional(),
    isBlocked : z.boolean().optional().default(false),
});

const updateUserValidationSchema = z.object({
    name : z.string().min(1, 'Name cannot be empty').optional(),
    email : z.string().email('Invalid email format').optional(),
    role : z.enum(['user','admin']).optional(),
    password : z.string().optional(),
    image : z.string().url('Invalid image URL').optional(),
    coverImg : z.string().url('Invalid cover image URL').optional(),
    memberShip : membershipSchema.nullable().optional(),
    isBlocked : z.boolean().optional(),
}).strict().partial();


const followUnfollowValidationSchema = z.object({
    userId: objectIdSchema,
    targetedUserId: objectIdSchema,
});


export const userValidations = {
    createUserValidationSchema,
    updateUserValidationSchema,
    followUnfollowValidationSchema,
};