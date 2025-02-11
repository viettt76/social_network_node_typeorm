import { Server, Socket } from 'socket.io';
import { parse } from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getRedisClient } from '@/lib/redisClient';
import postEvent from './postEvent';
import relationshipEvent from './relationshipEvent';
import { addOnlineFriends, addUserOnline, removeOnlineFriends, removeUserOnline } from '@/services/redisService';

const events = (io: Server) => {
    io.on('connect', async (socket: Socket) => {
        try {
            const redisClient = getRedisClient();
            const cookies = socket.handshake.headers.cookie;
            if (!cookies) return socket.disconnect();

            const { token } = parse(cookies.trim());
            if (!token) return socket.disconnect();

            const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
            if (!JWT_ACCESS_SECRET) throw new Error('JWT secret is missing!');

            const userToken = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
            const userId = userToken.id;
            if (!userId) return socket.disconnect();

            socket.join(`user-${userToken.id}`);

            await addUserOnline(userId);
            await addOnlineFriends(userId);

            postEvent(socket);
            relationshipEvent(redisClient);

            socket.on('disconnect', async () => {
                socket.leave(`user-${userToken.id}`);
                await removeUserOnline(userId);
            });
        } catch (error) {
            console.error('Socket connection error:', error);
            socket.disconnect();
        }
    });
};

export default events;
