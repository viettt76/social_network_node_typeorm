import { Request, Response } from 'express';
import { postService } from '@/services/postService';
import { JwtPayload } from 'jsonwebtoken';
import { httpStatusCode } from '@/constants/httpStatusCode';
import { PostReactionType } from '@/entity/PostReaction';
import { IoRequest } from '@/custom';

class PostController {
    // [POST] /posts
    async createPost(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { content, images } = req.body;

        await postService.createPost({ posterId: id, content, images });
        return res.status(httpStatusCode.CREATED).json();
    }

    // [GET] /posts
    async getPosts(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { page } = req.query;
        const posts = await postService.getPosts({ userId: id, page: Number(page) });

        return res.status(httpStatusCode.OK).json(posts);
    }

    // [GET] /posts/reactionTypes
    async getReactionTypes(req: Request, res: Response): Promise<any> {
        const reactionTypes = PostReactionType;

        return res.status(httpStatusCode.OK).json(reactionTypes);
    }

    // [PUT] /posts/reactions
    async reactToPost(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { io } = req as IoRequest;
        const { postId, reactionType } = req.body;

        await postService.reactToPost({ postId, userId: id, reactionType });

        const newReactions = await postService.getReactionsOfPost(postId);
        io.emit('reactToPost', { postId, newReactions });

        return res.status(httpStatusCode.OK).json();
    }
}

export const postController = new PostController();
