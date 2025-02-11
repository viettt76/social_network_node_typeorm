import { getRedisClient } from '../lib/redisClient';
import { relationshipService } from '@/services/relationshipService';

const redisClient = getRedisClient();

export const addUserOnline = async (userId: string): Promise<void> => {
    await redisClient.sAdd('online_users', userId);
};

export const removeUserOnline = async (userId: string): Promise<void> => {
    await redisClient.sRem('online_users', userId);
};

export const getOnlineUsers = async (): Promise<string[]> => {
    return await redisClient.sMembers('online_users');
};

export const addOnlineFriends = async (userId: string): Promise<void> => {
    const friends = await relationshipService.getFriends(userId);

    await redisClient.sAdd(
        `friends:${userId}`,
        friends.map((friend) => friend.id),
    );
    await redisClient.expire(`friends:${userId}`, 86400);
};

export const removeOnlineFriends = async (userId: string): Promise<void> => {
    await redisClient.del(`friends:${userId}`);
};

export const getOnlineFriendsFromRedis = async (userId: string): Promise<string[]> => {
    const exists = await redisClient.exists(`friends:${userId}`);

    if (exists) {
        return await redisClient.sMembers(`friends:${userId}`);
    } else {
        const friends = await relationshipService.getFriends(userId);
        return friends.map((friend) => friend.id);
    }
};
