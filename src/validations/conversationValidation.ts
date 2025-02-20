import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import validationHandler from '@/utils/validationHandler';
import { ConversationType } from '@/entity/Conversation';
import { MessageType } from '@/entity/Message';
import { MessageReactionType } from '@/entity/MessageReaction';

class ConversationValidation {
    getConversationWithFriend(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            friendId: Joi.string().uuid().required(),
        });

        validationHandler(correctValidation, req.params, res, next);
    }

    createConversation(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            type: Joi.string().valid(...Object.values(ConversationType)),
            name: Joi.string().optional().trim(),
            avatar: Joi.string().uri().optional(),
            participants: Joi.array().items(Joi.string().uuid()).min(1),
        });

        validationHandler(correctValidation, req.body, res, next);
    }

    sendMessage(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            conversationId: Joi.string().uuid().required(),
            content: Joi.string().allow('').trim(),
            type: Joi.string().valid(...Object.values(MessageType)),
            image: Joi.string()
                .uri()
                .messages({
                    'string.uri': 'Each image must be a valid URL.',
                })
                .when('content', {
                    is: '',
                    then: Joi.required().messages({
                        'any.required': 'Image are required when content is empty.',
                    }),
                    otherwise: Joi.optional(),
                }),
        });

        validationHandler(correctValidation, req.body, res, next);
    }

    getMessages(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            conversationId: Joi.string().uuid().required(),
        });

        validationHandler(correctValidation, req.params, res, next);
    }

    getGroupMembers(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            conversationId: Joi.string().uuid().required(),
        });

        validationHandler(correctValidation, req.params, res, next);
    }

    reactToMessage(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            messageId: Joi.string().uuid().required(),
            conversationId: Joi.string().uuid().required(),
            reactionType: Joi.string()
                .valid(...Object.values(MessageReactionType))
                .allow(null),
        });

        validationHandler(correctValidation, { ...req.params, ...req.body }, res, next);
    }
}
export const conversationValidation = new ConversationValidation();
