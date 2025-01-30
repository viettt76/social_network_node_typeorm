import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import validationHandler from '@/utils/validationHandler';
import { PostReactionType } from '@/entity/PostReaction';

class PostValidation {
    stripHtmlAndNewlines(html: string) {
        let strippedContent = html.replace(/<\/?[^>]+(>|$)/g, '');
        strippedContent = strippedContent.replace(/\n/g, '').trim();
        return strippedContent;
    }

    getPosts(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            page: Joi.number().min(1),
        });

        validationHandler(correctValidation, req.query, res, next);
    }

    createPost(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            content: Joi.string()
                .allow('')
                .custom((value) => {
                    const strippedContent = this.stripHtmlAndNewlines(value);
                    return strippedContent ? value : '';
                })
                .messages({
                    'string.base': 'Content must be a string.',
                }),
            images: Joi.array()
                .items(
                    Joi.string().uri().messages({
                        'string.uri': 'Each image must be a valid URL.',
                    }),
                )
                .when('content', {
                    is: '',
                    then: Joi.array().min(1).required().messages({
                        'array.min': 'At least one image is required if content is empty.',
                        'any.required': 'Images are required when content is empty.',
                    }),
                    otherwise: Joi.array().optional(),
                }),
        });

        validationHandler(correctValidation, req.body, res, next);
    }
}

export const postValidation = new PostValidation();
