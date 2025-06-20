import { z } from 'zod';

// FIX APPLIED HERE: Changed to 'as const' to make packageNames a tuple of literal strings
const packageNames = ['basic', 'standard', 'premium'] as const;

const initiatePaymentValidationSchema = z.object({
    // Use z.enum with the 'packageNames' tuple
    package: z.enum(packageNames, { message: `Package must be one of: ${packageNames.join(', ')}` }),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(1, 'Currency is required').max(3, 'Currency must be 3 characters (e.g., BDT, USD)').default('BDT'),
});

const paymentWebhookValidationSchema = z.object({
    mer_txnid: z.string().min(1, 'Transaction ID is required'),
    pay_status: z.enum(['Successful', 'Failed', 'Canceled'], { message: 'Invalid payment status' }),
    amount: z.string().transform((val) => parseFloat(val)).refine(val => !isNaN(val) && val > 0, { message: "Amount must be a positive number string" }),
    cus_name: z.string().optional(),
    cus_email: z.string().email().optional(),
    opt_a: z.string().min(1, 'Internal payment ID (opt_a) is required'),
    signature_received: z.string().min(1, 'Signature is required'),
}).passthrough();

export const paymentValidations = {
    initiatePaymentValidationSchema,
    paymentWebhookValidationSchema,
};