import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import validationHandler from '@/utils/validationHandler';
import { Gender } from '@/entity/User';

export const signup = (req: Request, res: Response, next: NextFunction) => {
    const correctValidation = Joi.object({
        firstName: Joi.string().max(30).required().trim().strict(),
        lastName: Joi.string().max(30).required().trim().strict(),
        username: Joi.string().min(6).max(30).required().trim().strict(),
        password: Joi.string()
            .min(8)
            .max(32)
            .regex(/\w/)
            .regex(/[@$!%*?&]/)
            .required()
            .trim()
            .strict(),
        gender: Joi.string().valid(...Object.values(Gender)),
    });

    validationHandler(correctValidation, req.body, res, next);
};

export const login = (req: Request, res: Response, next: NextFunction) => {
    const correctValidation = Joi.object({
        username: Joi.string().min(6).max(30).required().trim().strict(),
        password: Joi.string().min(8).max(32).required().trim().strict(),
    });

    validationHandler(correctValidation, req.body, res, next);
};
