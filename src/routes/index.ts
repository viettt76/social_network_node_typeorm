import { Application } from 'express';
import { Server } from 'socket.io';

import authRouter from './authRouter';
import userRouter from './userRouter';
import postRouter from './postRouter';

const routes = (app: Application, io: Server) => {
    app.use('/auth', authRouter);
    app.use('/user', userRouter(io));
    app.use('/posts', postRouter);
};

export default routes;
