import { Application } from 'express';
import { Server } from 'socket.io';

import authRouter from './authRouter';
import userRouter from './userRouter';
import postRouter from './postRouter';
import relationshipRouter from './relationshipRouter';
import notificationRouter from './notificationRouter';
import conversationRouter from './conversationRouter';

const routes = (app: Application, io: Server) => {
    app.use('/auth', authRouter);
    app.use('/notifications', notificationRouter);
    app.use('/users', userRouter(io));
    app.use('/posts', postRouter(io));
    app.use('/relationships', relationshipRouter(io));
    app.use('/conversations', conversationRouter(io));
};

export default routes;
