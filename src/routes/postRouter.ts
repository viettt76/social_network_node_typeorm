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
    router.put('/reactions/:postId', postValidation.reactToPost, postController.reactToPost);
    router.post('/comments', postValidation.sendComment, postController.sendComment);
    router.get('/comments/:postId', postValidation.getComments, postController.getComments);
    router.get('/comments/:commentId/replies', postValidation.getCommentReplies, postController.getCommentReplies);
    router.put('/comments/reactions/:commentId', postValidation.reactToComment, postController.reactToComment);

    return router;
};

export default postRouter;
