import express from 'express';
import { postController } from '@/controllers/postController';
import { postValidation } from '@/validations/postValidation';
import { Server } from 'socket.io';
import ioMiddleware from '@/middlewares/ioMiddleware';

const postRouter = (io: Server) => {
    const router = express.Router();

    router.use(ioMiddleware(io));

    router.post('/', postValidation.createPost, postController.createPost);
    router.get('/', postController.getPosts);
    router.get('/reactionTypes', postController.getReactionTypes);
    router.put('/reactions', postValidation.reactToPost, postController.reactToPost);
    router.post('/comments', postValidation.sendComment, postController.sendComment);
    router.get('/comments/:postId', postValidation.getComments, postController.getComments);

    return router;
};

export default postRouter;
