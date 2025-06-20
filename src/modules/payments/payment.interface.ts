import { Document, Types } from 'mongoose';
import { TMembership } from '../users/user.interface';

export type TPaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';
export type TPackageName = TMembership['package']['name'];

export type TPayment = {
    // _id is REMOVED from here. It will be provided by Mongoose's Document.
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