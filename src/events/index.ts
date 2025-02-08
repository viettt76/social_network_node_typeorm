import { RedisClientType } from 'redis';
import { Server } from 'socket.io';
import { parse } from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';

const events = (io: Server, client: RedisClientType) => {
    io.on('connect', async (socket) => {
        try {
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

            await client.setEx(`user_online_${userId}`, 300, 'true');

            socket.on('disconnect', async () => {
                socket.leave(`user-${userToken.id}`);
                await client.del(`user_online_${userToken.id}`);
            });
        } catch (error) {
            console.error('Socket connection error:', error);
            socket.disconnect();
        }
    });
};

export default events;
