import { Request, Response } from 'express';
import { postService } from '@/services/postService';
import { JwtPayload } from 'jsonwebtoken';
import { httpStatusCode } from '@/constants/httpStatusCode';
import { PostReactionType } from '@/entity/PostReaction';
import { IoRequest } from '@/custom';
import { userService } from '@/services/userService';
import { getOnlineFriendsFromRedis } from '@/services/redisService';

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

    // [PUT] /posts/reactions/:postId
    async reactToPost(req: Request, res: Response): Promise<any> {
        const { id, firstName, lastName } = req.userToken as JwtPayload;
        const { io } = req as IoRequest;
        const { postId } = req.params;
        const { posterId, reactionType } = req.body;

        const postReaction = await postService.getReactionOfPost({ postId, userId: id });

        const onlineFriends = await getOnlineFriendsFromRedis(posterId);

        if (!postReaction) {
            const newReaction = await postService.addReactToPost({ postId, userId: id, reactionType });
            const reactor = await userService.getUserFields({ userId: id, fields: ['avatar'] });

            const _newReaction = {
                postReactionId: newReaction.id,
                reactionType: newReaction.reactionType,
                user: {
                    userId: id,
                    firstName,
                    lastName,
                    avatar: reactor?.avatar,
                },
            };

            onlineFriends.forEach((friendId: string) => {
                io.to(`user-${friendId}`).emit('reactToPost', { postId, newReaction: _newReaction });
            });
            if (!onlineFriends.includes(id))
                io.to(`user-${id}`).emit('reactToPost', { postId, newReaction: _newReaction });
        } else if (reactionType) {
            await postService.updateReactToPost({ postReaction, reactionType });

            onlineFriends.forEach((friendId: string) => {
                io.to(`user-${friendId}`).emit('updateReactToPost', {
                    postId,
                    postReactionId: postReaction.id,
                    reactionType,
                });
            });
            if (!onlineFriends.includes(id))
                io.to(`user-${id}`).emit('updateReactToPost', {
                    postId,
                    postReactionId: postReaction.id,
                    reactionType,
                });
        } else {
            await postService.deleteReactToPost(postReaction.id);

            onlineFriends.forEach((friendId: string) => {
                io.to(`user-${friendId}`).emit('deleteReactToPost', {
                    postId,
                    postReactionId: postReaction.id,
                });
            });
            if (!onlineFriends.includes(id))
                io.to(`user-${id}`).emit('deleteReactToPost', { postId, postReactionId: postReaction.id });
        }

        return res.status(httpStatusCode.OK).json();
    }

    // [POST] /posts/comments
    async sendComment(req: Request, res: Response): Promise<any> {
        const { id, firstName, lastName } = req.userToken as JwtPayload;
        const { io } = req as IoRequest;
        const { postId, parentCommentId, content, image } = req.body;

        const newComment = await postService.sendComment({ postId, userId: id, parentCommentId, content, image });
        const commentator = await userService.getUserFields({ userId: id, fields: ['avatar'] });

        if (parentCommentId) {
            io.to(`post-${postId}`).emit('newReply', {
                id: newComment.id,
                postId,
                parentCommentId: newComment.parentCommentId,
                content: newComment.content,
                image: newComment.image,
                commentatorId: id,
                commentatorFirstName: firstName,
                commentatorLastName: lastName,
                commentatorAvatar: commentator?.avatar,
            });
        } else {
            io.to(`post-${postId}`).emit('newComment', {
                id: newComment.id,
                postId,
                content: newComment.content,
                image: newComment.image,
                commentatorId: id,
                commentatorFirstName: firstName,
                commentatorLastName: lastName,
                commentatorAvatar: commentator?.avatar,
            });
        }

        return res.status(httpStatusCode.CREATED).json();
    }

    // [GET] /posts/comments
    async getComments(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { postId } = req.params;
        const { page, sortField, sortType } = req.query as { page: string; sortField: string; sortType: string };

        const comments = await postService.getComments({
            userId: id,
            page: Number(page),
            postId,
            sortField,
            sortType: (sortType as 'DESC' | 'ASC') || 'DESC',
        });
        return res.status(httpStatusCode.OK).json(comments);
    }

    // [GET] /posts/comments/:commentId/replies
    async getCommentReplies(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { commentId } = req.params;
        const { page, sortField, sortType } = req.query as { page: string; sortField: string; sortType: string };

        const replies = await postService.getCommentReplies({
            userId: id,
            page: Number(page),
            parentCommentId: commentId,
            sortField,
            sortType: (sortType as 'DESC' | 'ASC') || 'DESC',
        });
        return res.status(httpStatusCode.OK).json(replies);
    }

    // [PUT] /posts/comments/reactions/:commentId
    async reactToComment(req: Request, res: Response): Promise<any> {
        const { id } = req.userToken as JwtPayload;
        const { io } = req as IoRequest;
        const { commentId } = req.params;
        const { postId, reactionType } = req.body;

        const newReaction = await postService.reactToComment({ commentId, userId: id, reactionType });

        io.to(`post-${postId}`).emit('reactToPost', { postId, newReaction });

        return res.status(httpStatusCode.OK).json();
    }
}

export const postController = new PostController();
