import { Server } from 'socket.io';
import express from 'express';
import { userController } from '@/controllers/userController';
import * as userValidations from '@/validations/userValidations';

const userRouter = (io: Server) => {
    const router = express.Router();

    router.get('/my-info', userController.getMyInfo);

    return router;
};

export default userRouter;
