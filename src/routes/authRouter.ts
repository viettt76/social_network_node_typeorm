import express from 'express';
import { authController } from '@/controllers/authController';
import * as authValidations from '@/validations/authValidations';

const router = express.Router();

router.post('/signup', authValidations.signup, authController.signup);
router.post('/login', authValidations.login, authController.login);
router.post('/logout', authController.logout);

export default router;
