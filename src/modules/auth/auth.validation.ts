import { z } from 'zod';
import { TLoginPayload, TRegisterPayload } from './auth.interface';

const loginValidationSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

const registerValidationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    image: z.string().url('Invalid image URL').optional(),
    role: z.enum(['user', 'admin']).optional().default('user'),
});

export const authValidations = {
    loginValidationSchema,
    registerValidationSchema,
};