import { Request, Response } from 'express';
import { httpStatusCode } from '@/constants/httpStatusCode';
import { CustomJwtPayload } from '@/custom';
import { movieService } from '@/services/movieService';

class MovieController {
    // [POST] /movies/favorites
    async addFavoriteMovie(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;
        const { movieId, name, slug, thumbUrl, type } = req.body;

        await movieService.createFavoriteMovie({
            userId: id,
            movieId,
            name,
            slug,
            thumbUrl,
            type,
        });

        return res.status(httpStatusCode.CREATED).json();
    }

    // [GET] /movies/favorites
    async getFavoriteMovies(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as CustomJwtPayload;

        const favoriteMovies = await movieService.getFavoriteMovies(id);

        return res.status(httpStatusCode.OK).json(favoriteMovies);
    }
}

export const movieController = new MovieController();
