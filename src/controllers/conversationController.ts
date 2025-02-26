import { Request, Response } from 'express';
import { CustomJwtPayload, IoRequest } from '@/custom';
import { httpStatusCode } from '@/constants/httpStatusCode';
import { conversationService } from '@/services/conversationService';
import { userService } from '@/services/userService';
import ApiError from '@/utils/ApiError';
import conversationResponse from '@/constants/conversationResponse';
import { ConversationType } from '@/entity/Conversation';
import { Role } from '@/entity/ConversationParticipant';

class ConversationController {
    // [GET] /conversations/friends/:friendId
    async getConversationWithFriend(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;
        const { friendId } = req.params;

        const conversation = await conversationService.getConversationPrivate({ userId: id, friendId });

        return res.status(httpStatusCode.OK).json(conversation);
    }

    // [GET] /conversations/groups
    async getGroupConversations(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;

        const groupConversations = await conversationService.getGroupConversations(id);

        return res.status(httpStatusCode.OK).json(groupConversations);
    }

    // [POST] /conversations
    async createConversation(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;
        const { type, name, avatar, participants } = req.body;

        const newConversation = await conversationService.createConversation({
            type,
            name,
            avatar,
            participants: [
                ...participants.map((p: string) => ({
                    userId: p,
                    role: null,
                })),
                { userId: id, role: type === ConversationType.PRIVATE ? null : Role.ADMIN },
            ],
        });

        return res.status(httpStatusCode.CREATED).json(newConversation);
    }

    // [POST] /conversations/messages
    async sendMessage(req: Request, res: Response): Promise<any> {
        const { id, firstName, lastName } = req.userToken as CustomJwtPayload;
        const { conversationId, content, type, image } = req.body;
        const { io } = req as IoRequest;

        const conversation = await conversationService.getConversationById(conversationId);

        if (!conversation) {
            throw new ApiError(
                conversationResponse.CONVERSATION_NOT_FOUND.status,
                conversationResponse.CONVERSATION_NOT_FOUND.message,
            );
        }

        const newMessage = await conversationService.createMessage({
            senderId: id,
            conversationId,
            content: content || image,
            type,
        });

        const sender = await userService.getUserFields({ userId: id, fields: ['avatar'] });

        const participants = await conversationService.getParticipants(conversationId);
        participants.forEach((participant) => {
            io.to(`user-${participant.userId}`).emit('newMessage', {
                messageId: newMessage.id,
                conversationType: conversation.type,
                conversationName: conversation.name,
                conversationAvatar: conversation.avatar,
                conversationId,
                content: newMessage.content,
                messageType: type,
                sender: {
                    userId: id,
                    firstName,
                    lastName,
                    avatar: sender?.avatar,
                },
                lastUpdated: newMessage.createdAt,
            });
        });
        return res.status(httpStatusCode.CREATED).json();
    }

    // [GET] /conversations/messages/:conversationId
    async getMessages(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;
        const { conversationId } = req.params;
        const { page } = req.query;

        const messages = await conversationService.getMessages({ conversationId, userId: id, page: Number(page) });

        return res.status(httpStatusCode.OK).json(messages);
    }

    // [GET] /conversations/recent
    async getRecentConversations(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;
        const { page } = req.query;

        const recentConversations = await conversationService.getRecentConversations({
            userId: id,
            page: Number(page),
        });

        const _recentConversations = recentConversations.map((c) => {
            return {
                conversationId: c.conversationId,
                conversationName:
                    c.conversationType === ConversationType.PRIVATE
                        ? `${c.friendLastName} ${c.friendFirstName}`
                        : c.conversationName,
                conversationType: c.conversationType,
                conversationAvatar:
                    c.conversationType === ConversationType.PRIVATE ? c.friendAvatar : c.conversationAvatar,
                conversationCreatedAt: c.conversationCreatedAt,
                senderId: c.senderId,
                senderFirstName: c.senderFirstName,
                senderLastName: c.senderLastName,
                senderAvatar: c.senderAvatar,
                lastMessageId: c.lastMessageId,
                lastMessageContent: c.lastMessageContent,
                lastMessageType: c.lastMessageType,
                lastUpdated: c.lastUpdated,
                ...(c.conversationType === ConversationType.PRIVATE && {
                    friendId: c.friendId,
                }),
            };
        });

        return res.status(httpStatusCode.OK).json(_recentConversations);
    }

    // [GET] /conversations/groups/members/:conversationId
    async getGroupMembers(req: Request, res: Response): Promise<any> {
        const { conversationId } = req.params;
        const { page } = req.query;

        const conversationParticipants = await conversationService.getGroupMembers({
            conversationId,
            page: Number(page),
        });

        return res.status(httpStatusCode.OK).json(conversationParticipants);
    }

    // [PUT] /conversations/reactions/:messageId
    async reactToMessage(req: Request, res: Response): Promise<any> {
        const { id, firstName, lastName } = req.userToken as CustomJwtPayload;
        const { messageId } = req.params;
        const { conversationId, reactionType } = req.body;
        const { io } = req as IoRequest;

        const participants = await conversationService.getParticipants(conversationId);

        if (!reactionType) {
            await conversationService.deleteMessageReaction({
                messageId,
                userId: id,
            });

            participants.forEach((participant) => {
                io.to(`user-${participant.userId}`).emit('removeReactToMessage', {
                    messageId,
                    userId: id,
                });
            });
        } else {
            await conversationService.upsertMessageReaction({
                messageId,
                userId: id,
                reactionType,
            });

            const sender = await userService.getUserFields({ userId: id, fields: ['avatar'] });

            participants.forEach((participant) => {
                io.to(`user-${participant.userId}`).emit('reactToMessage', {
                    messageId,
                    reactionType,
                    sender: {
                        userId: id,
                        firstName,
                        lastName,
                        avatar: sender?.avatar,
                    },
                });
            });
        }

        return res.status(httpStatusCode.OK).json();
    }
}

export const conversationController = new ConversationController();
