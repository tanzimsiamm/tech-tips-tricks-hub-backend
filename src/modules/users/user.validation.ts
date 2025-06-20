import { z } from "zod";
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

// Zod schema for Membership object
const membershipSchema = z.object({
    takenDate: z.string().datetime(),
    exp: z.string().datetime(),
    package: z.record(z.any()), // Or a more specific schema for package
}).nullable(); // Allows null or the object

const createUserValidationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().optional(), // Optional for user updates, required for register
    role: z.enum(['user', 'admin']).default('user'),
    image: z.string().url('Invalid image URL'),
    coverImg: z.string().url('Invalid cover image URL').optional(),
    memberShip: membershipSchema.optional().default(null),
    // followers and following are handled by service, not directly in initial creation payload
    isBlocked: z.boolean().optional().default(false),
});

const updateUserValidationSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().optional(), // Use for changing password, not directly updating hash
    role: z.enum(['user', 'admin']).optional(),
    image: z.string().url('Invalid image URL').optional(),
    coverImg: z.string().url('Invalid cover image URL').optional(),
    memberShip: membershipSchema.optional(), // Can update membership via a specific route/logic
    isBlocked: z.boolean().optional(),
}).strict().partial(); // Allow partial updates and disallow unknown fields

const followUnfollowValidationSchema = z.object({
    userId: objectIdSchema,
    targetedUserId: objectIdSchema,
});


export const userValidations = {
    createUserValidationSchema,
    updateUserValidationSchema,
    followUnfollowValidationSchema,
};