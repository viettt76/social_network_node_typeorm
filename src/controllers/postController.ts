import { Request, Response } from 'express';
import { postService } from '@/services/postService';
import { JwtPayload } from 'jsonwebtoken';
import { httpStatusCode } from '@/constants/httpStatusCode';

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
}

export const postController = new PostController();
