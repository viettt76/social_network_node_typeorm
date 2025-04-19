import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import validationHandler from '@/utils/validationHandler';

class AdminValidation {
    getPostsNotCensored(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            page: Joi.number().min(1),
        });

        validationHandler(correctValidation, req.query, res, next);
    }

    getRejectedPosts(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            page: Joi.number().min(1),
        });

        validationHandler(correctValidation, req.query, res, next);
    }

    approvePost(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            id: Joi.string().uuid().required(),
        });

        validationHandler(correctValidation, req.params, res, next);
    }

    rejectPost(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            id: Joi.string().uuid().required(),
        });

        validationHandler(correctValidation, req.params, res, next);
    }
}

export const adminValidation = new AdminValidation();
