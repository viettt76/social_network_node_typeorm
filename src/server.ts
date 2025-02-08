import 'tsconfig-paths/register';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import 'express-async-errors';
import routes from '@/routes';
import { AppDataSource } from '@/data-source';
import { errorHandler } from '@/utils/errorHandler';
import authMiddleware from '@/middlewares/authMiddleware';
import events from '@/events';
import { createClient, RedisClientType } from 'redis';

dotenv.config();

AppDataSource.initialize()
    .then(async () => {
        const port = process.env.PORT || 8080;
        const app = express();

        app.use(express.json());
        app.use(
            cors({
                origin: process.env.FRONTEND_URL,
                credentials: true,
            }),
        );
        app.use(cookieParser());

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                credentials: true,
            },
        });

        const client: RedisClientType = createClient({
            url: process.env.REDIS_URL,
        });

        client.on('connect', async () => {
            console.log('Redis client connected successfully');
        });

        client.on('error', (err) => {
            console.error('Redis client connection error:', err);
        });

        try {
            await client.connect();
        } catch (error) {
            console.error('Redis client connection failed', error);
        }

        app.use(authMiddleware);

        events(io, client);
        routes(app, io);

        app.use(errorHandler);

        server.listen(port, () => {
            console.log('Server running on port ' + port);
        });
    })
    .catch((error) => console.log(error));
