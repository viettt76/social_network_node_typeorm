import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import validationHandler from '@/utils/validationHandler';
import { Gender } from '@/entity/User';

class UserValidation {
    getUserInfo(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            userId: Joi.string().uuid().required(),
        });

        validationHandler(correctValidation, req.params, res, next);
    }

    changeInformation(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            firstName: Joi.string().allow(''),
            lastName: Joi.string().allow(''),
            birthday: Joi.date().allow(null),
            gender: Joi.string().valid(...Object.values(Gender)),
            hometown: Joi.string().allow(''),
            school: Joi.string().allow(''),
            workplace: Joi.string().allow(''),
            avatar: Joi.string().uri().allow(null),
            isPrivate: Joi.boolean().allow(null),
        }).or('firstName', 'lastName', 'birthday', 'gender', 'hometown', 'school', 'workplace', 'avatar', 'isPrivate');

        validationHandler(correctValidation, req.body, res, next);
    }
}
export const userValidation = new UserValidation();
