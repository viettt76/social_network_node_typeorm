import { movieController } from '@/controllers/movieController';
import { movieValidation } from '@/validations/movieValidation';
import express from 'express';

const movieRouter = express.Router();

movieRouter.post('/favorites', movieValidation.addFavoriteMovie, movieController.addFavoriteMovie);
movieRouter.get('/favorites', movieController.getFavoriteMovies);

export default movieRouter;
