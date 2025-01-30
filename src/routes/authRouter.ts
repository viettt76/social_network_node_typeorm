import express from 'express';
import { authController } from '@/controllers/authController';
import { authValidation } from '@/validations/authValidation';

const authRouter = express.Router();

authRouter.post('/signup', authValidation.signup, authController.signup);
authRouter.post('/login', authValidation.login, authController.login);
authRouter.post('/logout', authController.logout);

export default authRouter;
