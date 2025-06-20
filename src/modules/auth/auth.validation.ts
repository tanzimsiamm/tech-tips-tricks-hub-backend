import { z } from 'zod';
import { TLoginPayload, TRegisterPayload } from './auth.interface';

const loginValidationSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

const registerValidationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'), // As per your requirement
    image: z.string().url('Invalid image URL').optional(), // Default to a placeholder if not provided
    role: z.enum(['user', 'admin']).optional().default('user'), // Default role for new registrations
});

export const authValidations = {
    loginValidationSchema,
    registerValidationSchema,
};