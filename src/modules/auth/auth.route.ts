import express from 'express';
import { authControllers } from './auth.controller';
import validateRequest from '../../middleware/validateRequest'; // Import validateRequest
import { authValidations } from './auth.validation'; // Import validations

const router = express.Router();

router.post('/register', validateRequest(authValidations.registerValidationSchema), authControllers.register);
router.post('/login', validateRequest(authValidations.loginValidationSchema), authControllers.login);

export default router;