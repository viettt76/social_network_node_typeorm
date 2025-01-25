import { Application } from 'express';
import { Server } from 'socket.io';

import authRouter from './authRouter';
import userRouter from './userRouter';

const routes = (app: Application, io: Server) => {
    app.use('/auth', authRouter);
    app.use('/user', userRouter(io));
};

export default routes;
