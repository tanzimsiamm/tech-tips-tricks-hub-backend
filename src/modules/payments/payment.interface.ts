import { Document, Types } from 'mongoose';
import { TMembership } from '../users/user.interface';

export type TPaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';
export type TPackageName = TMembership['package']['name'];

export type TPayment = {
    // === REMOVE _ID FROM HERE ===
    // _id?: Types.ObjectId; // <--- REMOVE THIS LINE
    user: Types.ObjectId;
    package: TPackageName;
    amount: number;
    currency: string;
    transactionId?: string;
    status: TPaymentStatus;
    gatewayResponse?: object;
    paymentDate?: Date;
    expiryDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

export interface IPaymentDocument extends TPayment, Document {}

export type TInitiatePaymentPayload = Pick<TPayment, 'package' | 'amount' | 'currency'>;
export type TPaymentWebhookPayload = any;