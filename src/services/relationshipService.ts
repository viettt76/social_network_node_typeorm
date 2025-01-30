import { AppDataSource } from '@/data-source';
import { FriendRequest } from '@/entity/FriendRequest';

const friendRequestRepository = AppDataSource.getRepository(FriendRequest);

class RelationshipService {
    async getFriendRequestByUserId({
        userId,
        receiverId,
    }: {
        userId: string;
        receiverId: string;
    }): Promise<FriendRequest | null> {
        return await friendRequestRepository.findOne({
            where: [
                {
                    senderId: userId,
                    receiverId,
                },
                { senderId: receiverId, receiverId: userId },
            ],
        });
    }

    async createFriendRequest({ userId, receiverId }: { userId: string; receiverId: string }): Promise<any> {
        await friendRequestRepository.insert({
            senderId: userId,
            receiverId,
        });
    }
}

export const relationshipService = new RelationshipService();
