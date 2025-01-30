import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import validationHandler from '@/utils/validationHandler';

class UserValidation {
    getUserInfo(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            userId: Joi.string().uuid().required(),
        });

        validationHandler(correctValidation, req.params, res, next);
    }
}
export const userValidation = new UserValidation();
