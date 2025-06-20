import express from 'express';
import { paymentControllers } from './payment.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { paymentValidations } from './payment.validation';
import { USER_ROLES } from '../../constants/userRoles';

const router = express.Router();

router.post('/initiate', auth(USER_ROLES.USER), validateRequest(paymentValidations.initiatePaymentValidationSchema), paymentControllers.initiatePayment);

// Webhook endpoint (public route)
// Note: Ensure Express app uses correct body parser for webhook (e.g., express.urlencoded or express.raw)
router.post('/webhook', paymentControllers.handleWebhook);

router.get('/history', auth(USER_ROLES.USER, USER_ROLES.ADMIN), paymentControllers.getPaymentHistory);

export default router;