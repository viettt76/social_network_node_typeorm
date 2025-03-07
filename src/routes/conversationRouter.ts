import { conversationController } from '@/controllers/conversationController';
import ioMiddleware from '@/middlewares/ioMiddleware';
import { conversationValidation } from '@/validations/conversationValidation';
import express from 'express';
import { Server } from 'socket.io';

const conversationRouter = (io: Server) => {
    const router = express.Router();

    router.use(ioMiddleware(io));

    router.get(
        '/friends/:friendId',
        conversationValidation.getConversationWithFriend,
        conversationController.getConversationWithFriend,
    );
    router.get('/groups', conversationController.getGroupConversations);
    router.post('/', conversationValidation.createConversation, conversationController.createConversation);
    router.post('/messages', conversationValidation.sendMessage, conversationController.sendMessage);
    router.get('/messages/:conversationId', conversationValidation.getMessages, conversationController.getMessages);
    router.get('/recent', conversationValidation.getRecentConversations, conversationController.getRecentConversations);
    router.get(
        '/groups/members/:conversationId',
        conversationValidation.getGroupMembers,
        conversationController.getGroupMembers,
    );
    router.put('/reactions/:messageId', conversationValidation.reactToMessage, conversationController.reactToMessage);
    router.post(
        '/members/:conversationId',
        conversationValidation.addGroupMembers,
        conversationController.addGroupMembers,
    );

    return router;
};

export default conversationRouter;
