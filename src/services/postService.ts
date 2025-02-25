import { AppDataSource } from '@/data-source';
import { PostReaction, PostReactionType } from '@/entity/PostReaction';
import { ImageOfPost } from '@/entity/ImageOfPost';
import { Post, PostStatus, PostVisibility } from '@/entity/Post';
import { Relationship } from '@/entity/Relationship';
import { User } from '@/entity/User';
import { Comment } from '@/entity/Comment';
import { pageSize } from '@/constants';
import { CommentReaction, CommentReactionType } from '@/entity/CommentReaction';

const postRepository = AppDataSource.getRepository(Post);
const imageOfPostRepository = AppDataSource.getRepository(ImageOfPost);
const postReactionRepository = AppDataSource.getRepository(PostReaction);
const commentRepository = AppDataSource.getRepository(Comment);
const commentReactionRepository = AppDataSource.getRepository(CommentReaction);

class PostService {
    async getPostFields({ postId, fields }: { postId: string; fields: string[] }): Promise<Post | null> {
        const obj = Object.fromEntries(fields.map((field) => [field, true]));
        return await postRepository.findOne({
            where: { id: postId },
            select: obj,
        });
    }

    async getPostReaction({ postId, userId }: { postId: string; userId: string }): Promise<PostReaction | null> {
        return await postReactionRepository.findOne({
            where: { postId, userId },
        });
    }

    async getReactionsOfPost(postId: string): Promise<PostReaction[] | null> {
        return await postReactionRepository.find({
            where: { postId },
        });
    }

    async createPost(postData: {
        posterId: string;
        content?: string;
        images?: string[];
        visibilityType?: PostVisibility;
    }): Promise<Post> {
        const { posterId, content, images, visibilityType } = postData;
        const newPost = await postRepository.save({
            posterId,
            content,
            visibilityType,
        });

        if (images && images?.length > 0) {
            await Promise.all(
                images.map(async (image) => {
                    await imageOfPostRepository.insert({
                        postId: newPost.id,
                        imageUrl: image,
                    });
                }),
            );
        }

        return newPost;
    }

    async getPosts({ userId, page }: { userId: string; page: number }): Promise<any[]> {
        const posts = await postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect(ImageOfPost, 'image', 'image.postId = post.id')
            .innerJoin(User, 'poster', 'poster.id = post.poster')
            .leftJoin(
                (qb) =>
                    qb
                        .from(Comment, 'c')
                        .select('c.postId', 'postId')
                        .addSelect('COUNT(*)', 'totalComments')
                        .groupBy('c.postId'),
                'commentCount',
                'commentCount.postId = post.id',
            )
            .select([
                'post.id as postId',
                'post.posterId as posterId',
                'poster.firstName as posterFirstName',
                'poster.lastName as posterLastName',
                'poster.avatar as posterAvatar',
                'post.visibilityType as visibilityType',
                'post.content as content',
                'post.createdAt as createdAt',
                "CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', image.id, 'imageUrl', image.imageUrl)), ']') as images",
            ])
            .addSelect((qb) => {
                return qb
                    .subQuery()
                    .from(PostReaction, 'pr')
                    .select('pr.reactionType')
                    .where('pr.userId = :userId AND pr.postId = post.id', {
                        userId,
                    });
            }, 'currentReactionType')
            .addSelect('COALESCE(commentCount.totalComments, 0)', 'commentsCount')
            .where((qb) => {
                const subQuery1 = qb
                    .subQuery()
                    .select('r.user2Id')
                    .from(Relationship, 'r')
                    .where('r.user1Id = :userId', { userId })
                    .getQuery();

                const subQuery2 = qb
                    .subQuery()
                    .select('r.user1Id')
                    .from(Relationship, 'r')
                    .where('r.user2Id = :userId', { userId })
                    .getQuery();

                return `(post.posterId IN (${subQuery1}) OR post.posterId IN (${subQuery2}))`;
            })
            .andWhere('post.status != :postStatus', { postStatus: PostStatus.INVALID })
            .offset((page - 1) * pageSize.posts)
            .limit(pageSize.posts)
            .groupBy('post.id')
            .orderBy('post.createdAt', 'DESC')
            .getRawMany();

        const result = await Promise.all(
            posts.map(async (post) => {
                const reactions = await postReactionRepository.find({
                    relations: ['user'],
                    where: { postId: post.postId },
                    select: {
                        id: true,
                        reactionType: true,
                        user: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                });
                return {
                    postId: post.postId,
                    visibilityType: post.visibilityType,
                    content: post.content,
                    createdAt: post.createdAt,
                    posterInfo: {
                        userId: post.posterId,
                        firstName: post.posterFirstName,
                        lastName: post.posterLastName,
                        avatar: post.posterAvatar,
                    },
                    currentReactionType: post.currentReactionType,
                    commentsCount: Number(post.commentsCount),
                    reactions,
                    images: JSON.parse(post.images)[0]?.id === null ? [] : JSON.parse(post.images),
                };
            }),
        );

        return result;
    }

    async getMyPosts({ userId, page }: { userId: string; page: number }): Promise<any[]> {
        const posts = await postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect(ImageOfPost, 'image', 'image.postId = post.id')
            .innerJoin(User, 'poster', 'poster.id = post.poster')
            .leftJoin(
                (qb) =>
                    qb
                        .from(Comment, 'c')
                        .select('c.postId', 'postId')
                        .addSelect('COUNT(*)', 'totalComments')
                        .groupBy('c.postId'),
                'commentCount',
                'commentCount.postId = post.id',
            )
            .select([
                'post.id as postId',
                'post.posterId as posterId',
                'poster.firstName as posterFirstName',
                'poster.lastName as posterLastName',
                'poster.avatar as posterAvatar',
                'post.visibilityType as visibilityType',
                'post.content as content',
                'post.createdAt as createdAt',
                "CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', image.id, 'imageUrl', image.imageUrl)), ']') as images",
            ])
            .addSelect((qb) => {
                return qb
                    .subQuery()
                    .from(PostReaction, 'pr')
                    .select('pr.reactionType')
                    .where('pr.userId = :userId AND pr.postId = post.id', {
                        userId,
                    });
            }, 'currentReactionType')
            .addSelect('COALESCE(commentCount.totalComments, 0)', 'commentsCount')
            .where('post.posterId = :userId', { userId })
            .andWhere('post.status != :postStatus', { postStatus: PostStatus.INVALID })
            .offset((page - 1) * pageSize.posts)
            .limit(pageSize.posts)
            .groupBy('post.id')
            .orderBy('post.createdAt', 'DESC')
            .getRawMany();

        const result = await Promise.all(
            posts.map(async (post) => {
                const reactions = await postReactionRepository.find({
                    relations: ['user'],
                    where: { postId: post.postId },
                    select: {
                        id: true,
                        reactionType: true,
                        user: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                });
                return {
                    postId: post.postId,
                    visibilityType: post.visibilityType,
                    content: post.content,
                    createdAt: post.createdAt,
                    posterInfo: {
                        userId: post.posterId,
                        firstName: post.posterFirstName,
                        lastName: post.posterLastName,
                        avatar: post.posterAvatar,
                    },
                    currentReactionType: post.currentReactionType,
                    commentsCount: Number(post.commentsCount),
                    reactions,
                    images: JSON.parse(post.images)[0]?.id === null ? [] : JSON.parse(post.images),
                };
            }),
        );

        return result;
    }

    async addPostReaction({
        postId,
        userId,
        reactionType,
    }: {
        postId: string;
        userId: string;
        reactionType: PostReactionType;
    }): Promise<PostReaction> {
        return await postReactionRepository.save({
            postId,
            userId,
            reactionType,
        });
    }

    async updatePostReaction({
        postReaction,
        reactionType,
    }: {
        postReaction: PostReaction;
        reactionType: PostReactionType;
    }): Promise<void> {
        postReaction.reactionType = reactionType;
        await postReactionRepository.save(postReaction);
    }

    async deletePostReaction(postReactionId: string) {
        await postReactionRepository.delete({ id: postReactionId });
    }

    async createComment(commentData: {
        postId: string;
        userId: string;
        parentCommentId: string;
        content: string;
        image: string;
    }): Promise<any> {
        const { postId, userId, parentCommentId, content, image } = commentData;

        return await commentRepository.save({
            postId,
            commentatorId: userId,
            parentCommentId,
            content,
            image,
        });
    }

    async getComments({
        userId,
        postId,
        page,
        sortField,
        sortType,
    }: {
        userId: string;
        postId: string;
        page: number;
        sortField: string;
        sortType: 'DESC' | 'ASC';
    }): Promise<any[]> {
        const rawComments = await commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.commentator', 'commentatarInfo')
            .leftJoinAndSelect('comment.replies', 'reply')
            .leftJoinAndSelect('comment.reactions', 'reaction')
            .select([
                'comment.id as commentId',
                'comment.content as content',
                'comment.image as image',
                'comment.createdAt as createdAt',
                'commentatarInfo.id as commentatorId',
                'commentatarInfo.firstName as commentatorFirstName',
                'commentatarInfo.lastName as commentatorLastName',
                'commentatarInfo.avatar as commentatorAvatar',
            ])
            .addSelect('COUNT(reply.id)', 'repliesCount')
            .addSelect((qb) => {
                return qb
                    .subQuery()
                    .from(CommentReaction, 'cr')
                    .where('cr.commentId = comment.id AND cr.userId = :userId', {
                        userId,
                    })
                    .select('cr.reactionType');
            }, 'currentReactionType')
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.parentCommentId IS NULL')
            .groupBy('comment.id')
            .orderBy(`comment.${sortField ?? 'createdAt'}`, sortType ?? 'DESC')
            .offset((page - 1) * pageSize.comments)
            .limit(pageSize.comments)
            .getRawMany();

        const comments = await Promise.all(
            rawComments.map(async (comment) => {
                const reactions = await commentReactionRepository.find({
                    relations: ['user'],
                    where: { commentId: comment.commentId },
                    select: {
                        id: true,
                        reactionType: true,
                        user: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                });

                return {
                    commentId: comment.commentId,
                    content: comment.content,
                    image: comment.image,
                    createdAt: comment.createdAt,
                    commentatorId: comment.commentatorId,
                    commentatorFirstName: comment.commentatorFirstName,
                    commentatorLastName: comment.commentatorLastName,
                    commentatorAvatar: comment.commentatorAvatar,
                    currentReactionType: comment.currentReactionType,
                    reactions,
                    repliesCount: comment.repliesCount,
                };
            }),
        );

        return comments;
    }

    async getCommentReplies({
        userId,
        parentCommentId,
        page,
        sortField,
        sortType,
    }: {
        userId: string;
        parentCommentId: string;
        page: number;
        sortField: string;
        sortType: 'DESC' | 'ASC';
    }): Promise<any[]> {
        const rawComments = await commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.commentator', 'commentatarInfo')
            .leftJoinAndSelect('comment.replies', 'reply')
            .select([
                'comment.id as commentId',
                'comment.parentCommentId as parentCommentId',
                'comment.content as content',
                'comment.image as image',
                'comment.createdAt as createdAt',
                'commentatarInfo.id as commentatorId',
                'commentatarInfo.firstName as commentatorFirstName',
                'commentatarInfo.lastName as commentatorLastName',
                'commentatarInfo.avatar as commentatorAvatar',
            ])
            .addSelect('COUNT(reply.id)', 'repliesCount')
            .addSelect((qb) => {
                return qb
                    .subQuery()
                    .from(CommentReaction, 'cr')
                    .where('cr.commentId = comment.id AND cr.userId = :userId', {
                        userId,
                    })
                    .select('cr.reactionType');
            }, 'currentReactionType')
            .where('comment.parentCommentId = :parentCommentId', { parentCommentId })
            .groupBy('comment.id')
            .orderBy(`comment.${sortField ?? 'createdAt'}`, sortType ?? 'DESC')
            .offset((page - 1) * pageSize.comments)
            .limit(pageSize.comments)
            .getRawMany();

        const comments = await Promise.all(
            rawComments.map(async (comment) => {
                const reactions = await commentReactionRepository.find({
                    relations: ['user'],
                    where: { commentId: comment.commentId },
                    select: {
                        id: true,
                        reactionType: true,
                        user: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                });

                return {
                    commentId: comment.commentId,
                    parentCommentId: comment.parentCommentId,
                    content: comment.content,
                    image: comment.image,
                    createdAt: comment.createdAt,
                    commentatorId: comment.commentatorId,
                    commentatorFirstName: comment.commentatorFirstName,
                    commentatorLastName: comment.commentatorLastName,
                    commentatorAvatar: comment.commentatorAvatar,
                    currentReactionType: comment.currentReactionType,
                    reactions,
                    repliesCount: comment.repliesCount,
                };
            }),
        );

        return comments;
    }

    async getCommentReaction({
        userId,
        commentId,
    }: {
        userId: string;
        commentId: string;
    }): Promise<CommentReaction | null> {
        return commentReactionRepository.findOne({
            where: { userId, commentId },
        });
    }

    async addCommentReaction({
        commentId,
        userId,
        reactionType,
    }: {
        commentId: string;
        userId: string;
        reactionType: CommentReactionType;
    }): Promise<CommentReaction> {
        return await commentReactionRepository.save({
            commentId,
            userId,
            reactionType,
        });
    }

    async updateCommentReaction({
        commentReaction,
        reactionType,
    }: {
        commentReaction: CommentReaction;
        reactionType: CommentReactionType;
    }): Promise<void> {
        commentReaction.reactionType = reactionType;
        await commentReactionRepository.save(commentReaction);
    }

    async deleteCommentReaction(commentReactionId: string): Promise<any> {
        await commentReactionRepository.delete({ id: commentReactionId });
    }
}

export const postService = new PostService();
