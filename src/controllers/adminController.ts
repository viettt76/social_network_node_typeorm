import { Request, Response } from 'express';
import { httpStatusCode } from '@/constants/httpStatusCode';
import { adminService } from '@/services/adminService';
import { PostStatus } from '@/entity/Post';

class AdminController {
    // [GET] /admin/posts-not-censored
    async getPostsNotCensored(req: Request, res: Response): Promise<any> {
        const { page } = req.query;

        const posts = await adminService.getPostsNotCensored(Number(page));

        return res.status(httpStatusCode.OK).json(posts);
    }

    // [GET] /admin/rejected-posts
    async getRejectedPosts(req: Request, res: Response): Promise<any> {
        const { page } = req.query;

        const posts = await adminService.getRejectedPosts(Number(page));

        return res.status(httpStatusCode.OK).json(posts);
    }

    // [PATCH] /admin/approve-post/:id
    async approvePost(req: Request, res: Response): Promise<any> {
        const { id } = req.params;

        await adminService.updatePostStatus({ postId: id, status: PostStatus.APPROVED });

        return res.status(httpStatusCode.OK).json();
    }

    // [PATCH] /admin/reject-post/:id
    async rejectPost(req: Request, res: Response): Promise<any> {
        const { id } = req.params;

        await adminService.updatePostStatus({ postId: id, status: PostStatus.INVALID });

        return res.status(httpStatusCode.OK).json();
    }
}

export const adminController = new AdminController();
