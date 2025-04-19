import express from 'express';
import { authController } from '@/controllers/authController';
import { authValidation } from '@/validations/authValidation';

const authRouter = express.Router();

authRouter.post('/users', authValidation.signup, authController.signup);
authRouter.post('/token', authValidation.login, authController.login);
authRouter.delete('/token', authController.logout);
authRouter.patch('/password', authController.changePassword);
authRouter.delete('/account', authController.deleteAccount);
authRouter.post('/recover-account', authController.recoverAccount);

export default authRouter;
