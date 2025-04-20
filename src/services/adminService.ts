import { pageSize } from '@/constants';
import { postResponse } from '@/constants/postResponse';
import { AppDataSource } from '@/data-source';
import { ImageOfPost } from '@/entity/ImageOfPost';
import { Post, PostStatus } from '@/entity/Post';
import { User } from '@/entity/User';
import ApiError from '@/utils/ApiError';

const postRepository = AppDataSource.getRepository(Post);

class AdminService {
    async getPostsNotCensored(page: number): Promise<any[]> {
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
            .where('post.status != :postStatus', { postStatus: PostStatus.INVALID })
            .offset((page - 1) * pageSize.posts)
            .limit(pageSize.posts)
            .groupBy('post.id')
            .orderBy('post.createdAt', 'DESC')
            .getRawMany();

        const result = posts.map((post) => ({
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
            images: JSON.parse(post.images)[0]?.id === null ? [] : JSON.parse(post.images),
        }));

        return result;
    }

    async getRejectedPosts(page: number): Promise<any[]> {
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
            .where('post.status = :postStatus', { postStatus: PostStatus.INVALID })
            .offset((page - 1) * pageSize.posts)
            .limit(pageSize.posts)
            .groupBy('post.id')
            .orderBy('post.createdAt', 'DESC')
            .getRawMany();

        const result = posts.map((post) => ({
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
            images: JSON.parse(post.images)[0]?.id === null ? [] : JSON.parse(post.images),
        }));

        return result;
    }

    async updatePostStatus({ postId, status }: { postId: string; status: PostStatus }): Promise<void> {
        const post = await postRepository.findOneBy({ id: postId });

        if (!post) {
            throw new ApiError(postResponse.POST_NOT_FOUND.status, postResponse.POST_NOT_FOUND.message);
        }

        post.status = status;

        await postRepository.save(post);
    }
}

export const adminService = new AdminService();
