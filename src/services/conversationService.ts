import { pageSize } from '@/constants';
import { AppDataSource } from '@/data-source';
import { Conversation, ConversationType } from '@/entity/Conversation';
import { ConversationParticipant, Role } from '@/entity/ConversationParticipant';
import { Message, MessageType } from '@/entity/Message';

const conversationRepository = AppDataSource.getRepository(Conversation);
const conversationParticipantRepository = AppDataSource.getRepository(ConversationParticipant);
const messageRepository = AppDataSource.getRepository(Message);

class ConversationService {
    async getConversationPrivate({
        userId,
        friendId,
    }: {
        userId: string;
        friendId: string;
    }): Promise<Conversation | null | undefined> {
        return await conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin(ConversationParticipant, 'cp1', 'cp1.conversationId = conversation.id')
            .innerJoin(ConversationParticipant, 'cp2', 'cp2.conversationId = conversation.id')
            .select(['conversation.id as conversationId'])
            .where('cp1.userId = :userId', { userId })
            .andWhere('cp2.userId = :friendId', { friendId })
            .andWhere('conversation.type = :conversationType', { conversationType: ConversationType.PRIVATE })
            .getRawOne();
    }

    async getGroupConversations(userId: string): Promise<Conversation[]> {
        return await conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin(ConversationParticipant, 'cp', 'cp.conversationId = conversation.id')
            .select([
                'conversation.id as conversationId',
                'conversation.type as type',
                'conversation.name as name',
                'conversation.avatar as avatar',
            ])
            .where('cp.userId = :userId', { userId })
            .andWhere('conversation.type = :conversationType', { conversationType: ConversationType.GROUP })
            .getRawMany();
    }

    async createConversation({
        type,
        name,
        avatar,
        participants,
    }: {
        type: ConversationType;
        name: string;
        avatar: string;
        participants: {
            userId: string;
            role: Role;
        }[];
    }): Promise<Conversation> {
        const newConversation = await conversationRepository.save({
            type,
            name,
            avatar,
        });
        await Promise.all(
            participants.map(async (participant) => {
                await conversationParticipantRepository.save({
                    userId: participant.userId,
                    conversationId: newConversation.id,
                    role: participant.role,
                });
            }),
        );
        return newConversation;
    }

    async createMessage({
        senderId,
        conversationId,
        content,
        type,
    }: {
        senderId: string;
        conversationId: string;
        content: string;
        type: MessageType;
    }): Promise<Message> {
        return await messageRepository.save({
            senderId,
            conversationId,
            content,
            messageType: type,
        });
    }

    async getMessages(conversationId: string) {
        const messages = await messageRepository.find({
            relations: ['sender'],
            where: { conversationId },
            select: {
                id: true,
                conversationId: true,
                content: true,
                messageType: true,
                sender: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
            order: {
                createdAt: 'DESC',
            },
        });
        return messages.reverse();
    }

    async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
        return await conversationParticipantRepository.find({
            where: { conversationId },
            select: {
                userId: true,
            },
        });
    }
}

export const conversationService = new ConversationService();
