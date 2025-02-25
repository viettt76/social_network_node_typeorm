import { pageSize } from '@/constants';
import { AppDataSource } from '@/data-source';
import { Conversation, ConversationType } from '@/entity/Conversation';
import { ConversationHistory } from '@/entity/ConversationHistory';
import { ConversationParticipant, Role } from '@/entity/ConversationParticipant';
import { Message, MessageType } from '@/entity/Message';
import { MessageReaction, MessageReactionType } from '@/entity/MessageReaction';

const conversationRepository = AppDataSource.getRepository(Conversation);
const conversationParticipantRepository = AppDataSource.getRepository(ConversationParticipant);
const conversationHistoryRepository = AppDataSource.getRepository(ConversationHistory);
const messageRepository = AppDataSource.getRepository(Message);
const messageReactionRepository = AppDataSource.getRepository(MessageReaction);

class ConversationService {
    async getConversationById(conversationId: string): Promise<Conversation | null> {
        return conversationRepository.findOneBy({ id: conversationId });
    }

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
            ...(type === ConversationType.GROUP && {
                name,
                avatar,
            }),
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
        const newMessage = await messageRepository.save({
            senderId,
            conversationId,
            content,
            messageType: type,
        });

        await conversationHistoryRepository.upsert(
            {
                userId: senderId,
                conversationId,
                lastMessageId: newMessage.id,
            },
            ['conversationId'],
        );

        return newMessage;
    }

    async getMessages({
        conversationId,
        userId,
        page,
    }: {
        conversationId: string;
        userId: string;
        page: number;
    }): Promise<any[]> {
        const messages = await messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.conversationId = :conversationId', { conversationId })
            .select([
                'message.id as id',
                'message.conversationId as conversationId',
                'message.content as content',
                'message.messageType as messageType',
                'sender.id as senderId',
                'sender.firstName as senderFirstName',
                'sender.lastName as senderLastName',
                'sender.avatar as senderAvatar',
            ])
            .orderBy('message.createdAt', 'DESC')
            .limit(pageSize.messages)
            .offset((page - 1) * pageSize.messages)
            .getRawMany();

        messages.reverse();

        const result = await Promise.all(
            messages.map(async (m) => {
                const reactions = await messageReactionRepository.find({
                    relations: ['user'],
                    where: { messageId: m.id },
                    select: {
                        id: true,
                        reactionType: true,
                        user: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                });
                return {
                    id: m.id,
                    conversationId: m.conversationId,
                    content: m.content,
                    messageType: m.messageType,
                    sender: {
                        id: m.senderId,
                        firstName: m.senderFirstName,
                        lastName: m.senderLastName,
                        avatar: m.senderAvatar,
                    },
                    reactions,
                    currentReaction: reactions.find((r) => r.user.id === userId)?.reactionType,
                };
            }),
        );
        return result;
    }

    async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
        return await conversationParticipantRepository.find({
            where: { conversationId },
            select: {
                userId: true,
            },
        });
    }

    async getRecentConversations(userId: string): Promise<any[]> {
        return await conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin(ConversationParticipant, 'cp1', 'cp1.conversationId = conversation.id')
            .leftJoin(
                ConversationParticipant,
                'otherCp',
                'otherCp.userId != :userId and conversation.id = otherCp.conversationId AND conversation.type = :privateType',
                { userId, privateType: ConversationType.PRIVATE },
            )
            .leftJoin('otherCp.user', 'friend')
            .where('cp1.userId = :userId OR conversation.type = :groupType', {
                userId,
                groupType: ConversationType.GROUP,
            })
            .leftJoinAndSelect('conversation.history', 'history')
            .leftJoinAndSelect('history.user', 'sender')
            .leftJoinAndSelect('history.lastMessage', 'lastMessage')
            .select([
                'conversation.id as conversationId',
                'conversation.name as conversationName',
                'conversation.type as conversationType',
                'conversation.avatar as conversationAvatar',
                'conversation.createdAt as conversationCreatedAt',
                'sender.id as senderId',
                'sender.firstName as senderFirstName',
                'sender.lastName as senderLastName',
                'sender.avatar as senderAvatar',
                'lastMessage.id as lastMessageId',
                'lastMessage.content as lastMessageContent',
                'lastMessage.messageType as lastMessageType',
                'history.createdAt as lastUpdated',
                'friend.id as friendId',
                'friend.firstName as friendFirstName',
                'friend.lastName as friendLastName',
                'friend.avatar as friendAvatar',
            ])
            .orderBy('COALESCE(history.updatedAt, conversation.createdAt)', 'DESC')
            .groupBy('history.id')
            .getRawMany();
    }

    async getGroupMembers(conversationId: string): Promise<ConversationParticipant[]> {
        return await conversationParticipantRepository
            .createQueryBuilder('cp')
            .innerJoinAndSelect('cp.user', 'userInfo')
            .where('cp.conversationId = :conversationId', { conversationId })
            .select([
                'cp.role as role',
                'cp.nickname as nickname',
                'userInfo.id as userId',
                'userInfo.firstName as userFirstName',
                'userInfo.lastName as userLastName',
                'userInfo.avatar as userAvatar',
            ])
            .orderBy('cp.role', 'DESC')
            .getRawMany();
    }

    async upsertMessageReaction({
        messageId,
        userId,
        reactionType,
    }: {
        messageId: string;
        userId: string;
        reactionType: MessageReactionType;
    }): Promise<void> {
        await messageReactionRepository.upsert(
            {
                messageId,
                userId,
                reactionType,
            },
            ['messageId', 'userId'],
        );
    }

    async deleteMessageReaction({ messageId, userId }: { messageId: string; userId: string }): Promise<void> {
        await messageReactionRepository.delete({
            messageId,
            userId,
        });
    }
}

export const conversationService = new ConversationService();
