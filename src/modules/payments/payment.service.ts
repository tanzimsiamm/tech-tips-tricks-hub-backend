import { Payment } from './payment.model';
import { User } from '../users/user.model';
import { TInitiatePaymentPayload, TPaymentWebhookPayload, TPaymentStatus } from './payment.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import axios from 'axios';
import config from '../../config';
import { notificationServices } from '../notifications/notification.service';
import { IPaymentDocument } from './payment.interface';  // Added missing import

const AAMARPAY_STORE_ID = config.AAMARPAY_STORE_ID;
const AAMARPAY_SIGNATURE_KEY = config.AAMARPAY_SIGNATURE_KEY;
const AAMARPAY_INIT_URL = config.NODE_ENV === 'production' ? 'https://secure.aamarpay.com/request.php' : 'https://sandbox.aamarpay.com/request.php';

const initiateAamarpayPayment = async (userId: string, payload: TInitiatePaymentPayload, userEmail: string) => {
    if (!AAMARPAY_STORE_ID || !AAMARPAY_SIGNATURE_KEY || !config.FRONTEND_URL) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'AAMARPAY or Frontend URL credentials not configured!');
    }

    const transactionId = `txn_${Date.now()}_${userId}`;

    const pendingPayment = await Payment.create({
        user: userId,
        package: payload.package,
        amount: payload.amount,
        currency: payload.currency,
        transactionId: transactionId,
        status: 'pending',
    });

    const formData = new URLSearchParams();
    formData.append('store_id', AAMARPAY_STORE_ID);
    formData.append('tran_id', transactionId);
    formData.append('success_url', `${config.FRONTEND_URL}/payment/success?paymentId=${pendingPayment._id}`);
    formData.append('fail_url', `${config.FRONTEND_URL}/payment/fail?paymentId=${pendingPayment._id}`);
    formData.append('cancel_url', `${config.FRONTEND_URL}/payment/cancel?paymentId=${pendingPayment._id}`);
    formData.append('amount', payload.amount.toFixed(2));
    formData.append('currency', payload.currency);
    formData.append('cus_name', userEmail);
    formData.append('cus_email', userEmail);
    formData.append('cus_add1', 'Dhaka');
    formData.append('cus_phone', '01XXXXXXXXX');
    formData.append('desc', `Payment for ${payload.package} package`);
    formData.append('opt_a', String(pendingPayment._id));
    formData.append('signature_key', AAMARPAY_SIGNATURE_KEY);

    try {
        const response = await axios.post(AAMARPAY_INIT_URL, formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.headers['content-type']?.includes('text/html')) {
            return { redirectUrl: response.request.res.responseUrl || AAMARPAY_INIT_URL };
        } else if (response.data.status === 'success' && response.data.GatewayPageURL) {
            return { redirectUrl: response.data.GatewayPageURL };
        } else {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `AAMARPAY initiation failed: ${response.data.message || 'Unknown error'}`);
        }

    } catch (error: any) {
        console.error('AAMARPAY initiation error:', error.response ? error.response.data : error.message);
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to initiate AAMARPAY payment.');
    }
};

const handleAamarpayWebhook = async (payload: TPaymentWebhookPayload) => {
    const { mer_txnid, pay_status, amount, opt_a, signature_received } = payload;
    const transactionId = mer_txnid;
    const internalPaymentId = opt_a;

    const payment = await Payment.findById(internalPaymentId);

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, 'Internal payment record not found!');
    }

    if (payment.status !== 'pending') {
        return { message: 'Payment already processed', payment };
    }

    let newStatus: TPaymentStatus = 'failed';
    if (pay_status === 'Successful') {
        newStatus = 'succeeded';
        payment.paymentDate = new Date();

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (payment.package === 'premium' ? 12 : 1));
        payment.expiryDate = expiryDate;

        await User.findByIdAndUpdate(payment.user,
            {
                memberShip: {
                    takenDate: payment.paymentDate,
                    exp: payment.expiryDate,
                    package: { name: payment.package, price: payment.amount }
                },
                isVerified: true
            },
            { new: true, runValidators: true }
        );

        await notificationServices.createNotification({
            user: payment.user,
            type: 'payment_success',
            message: `Your ${payment.package} membership payment of ${payment.amount} ${payment.currency} was successful!`,
            link: '/dashboard/membership',
        });

    } else if (pay_status === 'Canceled') {
        newStatus = 'cancelled';
    } else {
        newStatus = 'failed';
    }

    payment.status = newStatus;
    payment.transactionId = transactionId;
    payment.gatewayResponse = payload;
    await payment.save();

    return { message: 'Payment status updated', payment };
};

const getPaymentHistory = async (userId: string): Promise<IPaymentDocument[]> => {
    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });
    return payments;
};

export const paymentServices = {
    initiateAamarpayPayment,
    handleAamarpayWebhook,
    getPaymentHistory,
};