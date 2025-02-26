import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import validationHandler from '@/utils/validationHandler';
import { MovieType } from '@/entity/FavoriteMovie';

class MovieValidation {
    addFavoriteMovie(req: Request, res: Response, next: NextFunction) {
        const correctValidation = Joi.object({
            movieId: Joi.string().required().trim().strict(),
            name: Joi.string().required().trim().strict(),
            slug: Joi.string().required().trim().strict(),
            thumbUrl: Joi.string().uri().required(),
            type: Joi.string().valid(...Object.values(MovieType)),
        });

        validationHandler(correctValidation, req.body, res, next);
    }
}

export const movieValidation = new MovieValidation();
