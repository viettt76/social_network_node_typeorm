import { Server } from 'socket.io';
import express from 'express';
import { userController } from '@/controllers/userController';
import { userValidation } from '@/validations/userValidation';

const userRouter = (io: Server) => {
    const router = express.Router();

    router.get('/me', userController.getMyInfo);
    router.put('/information', userValidation.changeInformation, userController.changeInformation);

    return router;
};

export default userRouter;
