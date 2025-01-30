import { AppDataSource } from '@/data-source';
import { PostReaction, PostReactionType } from '@/entity/PostReaction';
import { PictureOfPost } from '@/entity/PictureOfPost';
import { Post, PostVisibility } from '@/entity/Post';
import { Relationship } from '@/entity/Relationship';
import { User } from '@/entity/User';
import { Comment } from '@/entity/Comment';

const postRepository = AppDataSource.getRepository(Post);
const pictureOfPostRepository = AppDataSource.getRepository(PictureOfPost);
const postReactionRepository = AppDataSource.getRepository(PostReaction);
const commentRepository = AppDataSource.getRepository(Comment);

class PostService {
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
                    await pictureOfPostRepository.insert({
                        postId: newPost.id,
                        pictureUrl: image,
                    });
                }),
            );
        }
    }

    async getPosts({ userId, page }: { userId: string; page: number }): Promise<any[]> {
        const pageSize = 2;

        const posts = await postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect(PictureOfPost, 'picture', 'picture.postId = post.id')
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
                "CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', picture.id, 'pictureUrl', picture.pictureUrl)), ']') as pictures",
            ])
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
            .offset((page - 1) * pageSize)
            .limit(pageSize)
            .groupBy('post.id')
            .orderBy('post.createdAt', 'DESC')
            .getRawMany();

        const result = await Promise.all(
            posts.map(async (post) => {
                //   const reactions = await reactionPostRepository.find({
                //     relations: ['reaction', 'userInfo'],
                //     where: { postId: post.id },
                //     select: {
                //       id: true,
                //       reaction: {
                //         id: true,
                //         name: true,
                //       },
                //       userInfo: {
                //         id: true,
                //         firstName: true,
                //         lastName: true,
                //         avatar: true,
                //       },
                //     },
                //   });
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
                    // reactions,
                    pictures: JSON.parse(post.pictures)[0]?.id === null ? [] : JSON.parse(post.pictures),
                };
            }),
        );

        return result;
    }
}

export const postService = new PostService();
