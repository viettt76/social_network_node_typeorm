import { Server } from 'socket.io';
import express from 'express';
import { userController } from '@/controllers/userController';

const userRouter = (io: Server) => {
    const router = express.Router();

    router.get('/me', userController.getMyInfo);

    return router;
};

export default userRouter;
