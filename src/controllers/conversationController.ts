import { Request, Response } from 'express';
import { CustomJwtPayload, IoRequest } from '@/custom';
import { httpStatusCode } from '@/constants/httpStatusCode';
import { conversationService } from '@/services/conversationService';
import { userService } from '@/services/userService';

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
        const { io } = req as IoRequest;

        const newConversation = await conversationService.createConversation({
            type,
            name,
            avatar,
            participants: [...participants, { userId: id, role: null }],
        });

        // participants.map((participant:string) => {
        //     io.to(`user-${participant}`).emit('newConversation', {newConversationId})
        // })

        return res.status(httpStatusCode.CREATED).json(newConversation);
    }

    // [POST] /conversations/messages
    async sendMessage(req: Request, res: Response): Promise<any> {
        const { id, firstName, lastName } = req.userToken as CustomJwtPayload;
        const { conversationId, content, type, image } = req.body;
        const { io } = req as IoRequest;

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
                conversationId,
                content: newMessage.content,
                messageType: newMessage.messageType,
                sender: {
                    userId: id,
                    firstName,
                    lastName,
                    avatar: sender?.avatar,
                },
            });
        });
        return res.status(httpStatusCode.CREATED).json();
    }

    // [GET] /conversations/messages/:conversationId
    async getMessages(req: Request, res: Response): Promise<any> {
        const { conversationId } = req.params;

        const messages = await conversationService.getMessages(conversationId);

        return res.status(httpStatusCode.OK).json(messages);
    }
}

export const conversationController = new ConversationController();
