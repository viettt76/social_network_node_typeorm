import { AppDataSource } from '@/data-source';
import { FavoriteMovie, MovieType } from '@/entity/FavoriteMovie';

const favoriteMovieRepository = AppDataSource.getRepository(FavoriteMovie);

class MovieService {
    async createFavoriteMovie(favoriteMovieData: {
        userId: string;
        movieId: string;
        name: string;
        slug: string;
        thumbUrl: string;
        type: MovieType;
    }): Promise<void> {
        const { userId, movieId, name, slug, thumbUrl, type } = favoriteMovieData;
        await favoriteMovieRepository.insert({
            userId,
            movieId,
            name,
            slug,
            thumbUrl,
            type,
        });
    }

    async getFavoriteMovies(userId: string): Promise<FavoriteMovie[]> {
        return favoriteMovieRepository.find({
            where: {
                userId,
            },
            select: {
                movieId: true,
                name: true,
                slug: true,
                thumbUrl: true,
                type: true,
            },
        });
    }
}

export const movieService = new MovieService();
