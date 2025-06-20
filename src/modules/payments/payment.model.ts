import { Schema, model, Types } from "mongoose";
import { IPaymentDocument, TPaymentStatus, TPackageName } from "./payment.interface";

const paymentSchema = new Schema<IPaymentDocument>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    package: {
        type: String,
        required: true,
        enum: ['basic', 'standard', 'premium'] as TPackageName[]
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        default: 'BDT'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'succeeded', 'failed', 'cancelled'] as TPaymentStatus[],
        default: 'pending',
    },
    gatewayResponse: {
        type: Schema.Types.Mixed,
    },
    paymentDate: {
        type: Date,
    },
    expiryDate: {
        type: Date,
    },
}, { timestamps : true });

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);