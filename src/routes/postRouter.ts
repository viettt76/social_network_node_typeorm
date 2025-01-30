import express from 'express';
import { postController } from '@/controllers/postController';
import { postValidation } from '@/validations/postValidation';

const postRouter = express.Router();

postRouter.post('/', postValidation.createPost, postController.createPost);
postRouter.get('/', postController.getPosts);

export default postRouter;
