import { z } from "zod";
import { Types } from 'mongoose';
import { TMembership, TUserBase } from "./user.interface";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

// Zod schema for Membership object
const membershipSchema = z.object({
    takenDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    exp: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    package: z.object({ // Correctly defined to match TMembership['package']
        name: z.string().min(1, 'Package name is required'),
        price: z.number().positive('Package price must be a positive number'),
    }),
}) as z.ZodType<TMembership>;



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