import { z } from 'zod';
import { TInitiatePaymentPayload, TPackageName } from './payment.interface';

const packageNames: TPackageName[] = ['basic', 'standard', 'premium'];

const initiatePaymentValidationSchema = z.object({
    package: z.enum(packageNames, { message: `Package must be one of: ${packageNames.join(', ')}` }),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(1, 'Currency is required').max(3, 'Currency must be 3 characters (e.g., BDT, USD)').default('BDT'),
});

// Webhook validation is highly specific to the payment gateway.
// This is a placeholder for Aamarpay simplified payload.
const paymentWebhookValidationSchema = z.object({
    mer_txnid: z.string().min(1, 'Transaction ID is required'),
    pay_status: z.enum(['Successful', 'Failed', 'Canceled'], { message: 'Invalid payment status' }),
    amount: z.string().transform((val) => parseFloat(val)).refine(val => !isNaN(val) && val > 0, { message: "Amount must be a positive number string" }), // Aamarpay sends amount as string
    cus_name: z.string().optional(),
    cus_email: z.string().email().optional(),
    opt_a: z.string().min(1, 'Internal payment ID (opt_a) is required'),
    signature_received: z.string().min(1, 'Signature is required'),
    // Add more fields as per Aamarpay documentation (e.g., card_type, bank_tran_id, etc.)
}).passthrough(); // Allow unknown fields as webhooks often have many

export const paymentValidations = {
    initiatePaymentValidationSchema,
    paymentWebhookValidationSchema,
};