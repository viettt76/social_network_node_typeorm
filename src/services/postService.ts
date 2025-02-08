import { AppDataSource } from '@/data-source';
import { PostReaction, PostReactionType } from '@/entity/PostReaction';
import { ImageOfPost } from '@/entity/ImageOfPost';
import { Post, PostVisibility } from '@/entity/Post';
import { Relationship } from '@/entity/Relationship';
import { User } from '@/entity/User';
import { Comment } from '@/entity/Comment';
import { IsNull, Not } from 'typeorm';
import { pageSize } from '@/constants';
import { CommentReaction } from '@/entity/CommentReaction';

const postRepository = AppDataSource.getRepository(Post);
const imageOfPostRepository = AppDataSource.getRepository(ImageOfPost);
const postReactionRepository = AppDataSource.getRepository(PostReaction);
const commentRepository = AppDataSource.getRepository(Comment);

class PostService {
    async getReactionOfPost({ postId, userId }: { postId: string; userId: string }): Promise<PostReaction | null> {
        return await postReactionRepository.findOne({
            where: { postId, userId },
        });
    }

    async getReactionsOfPost(postId: string): Promise<PostReaction[] | null> {
        return await postReactionRepository.find({
            where: { postId, reactionType: Not(IsNull()) },
        });
    }

    async createPost(postData: {
        posterId: string;
        content?: string;
        images?: string[];
        visibilityType?: PostVisibility;
    }): Promise<void> {
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
    }

    async getPosts({ userId, page }: { userId: string; page: number }): Promise<any[]> {
        const posts = await postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect(ImageOfPost, 'image', 'image.postId = post.id')
            .innerJoin(User, 'poster', 'poster.id = post.poster')
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
            .andWhere('post.isInvalid = false')
            .offset((page - 1) * pageSize.posts)
            .limit(pageSize.posts)
            .groupBy('post.id')
            .orderBy('post.createdAt', 'DESC')
            .getRawMany();

        const result = await Promise.all(
            posts.map(async (post) => {
                const reactions = await postReactionRepository.find({
                    relations: ['user'],
                    where: { postId: post.postId, reactionType: Not(IsNull()) },
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
                        firstName: post.posterFirstName,
                        lastName: post.posterLastName,
                        avatar: post.posterAvatar,
                    },
                    currentReactionType: post.currentReactionType,
                    reactions,
                    images: JSON.parse(post.images)[0]?.id === null ? [] : JSON.parse(post.images),
                };
            }),
        );

        return result;
    }

    async reactToPost({
        postId,
        userId,
        reactionType,
    }: {
        postId: string;
        userId: string;
        reactionType: PostReactionType | null;
    }): Promise<any> {
        const postReaction = await this.getReactionOfPost({ postId, userId });
        if (!!postReaction) {
            postReaction.reactionType = reactionType;
            await postReactionRepository.save(postReaction);
        } else {
            await postReactionRepository.insert({
                postId,
                userId,
                reactionType,
            });
        }
    }

    async sendComment(commentData: {
        postId: string;
        userId: string;
        parentCommentId: string;
        content: string;
        image: string;
    }): Promise<any> {
        const { postId, userId, parentCommentId, content, image } = commentData;

        await commentRepository.insert({
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
    }): Promise<Comment[]> {
        // const nestComments = (comments) => {
        //     const commentMap = {};
        //     const nestedComments = [];

        //     comments.forEach((comment) => {
        //         comment.children = [];
        //         commentMap[comment.id] = comment;
        //     });

        //     comments.forEach((comment) => {
        //         if (comment.parentCommentId) {
        //             const id = comment.parentCommentId;
        //             delete comment.parentCommentId;
        //             commentMap[id].children.push(comment);
        //         } else {
        //             delete comment.parentCommentId;
        //             nestedComments.push(comment);
        //         }
        //     });

        //     return nestedComments;
        // };
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
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.parentCommentId IS NULL')
            .groupBy('comment.id')
            .orderBy(`comment.${sortField ?? 'createdAt'}`, sortType ?? 'DESC')
            .offset((page - 1) * pageSize.posts)
            .limit(pageSize.comments)
            .getRawMany();

        // const comments = rawComments.map((comment) => {
        //     return {
        //         id: comment.id,
        //         parentCommentId: comment.parentCommentId,
        //         content: comment.content,
        //         createdAt: comment.createdAt,
        //         currentEmotionName: comment.currentEmotionName,
        //         commentatorInfo: {
        //             id: comment.commentatorId,
        //             firstName: comment.commentatorFirstName,
        //             lastName: comment.commentatorLastName,
        //             avatar: comment.commentatorAvatar,
        //         },
        //     };
        // });

        // const numberOfComments = comments.length;

        // const result = nestComments(comments);

        return rawComments;
    }
}

export const postService = new PostService();
