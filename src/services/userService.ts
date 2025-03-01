import { AppDataSource } from '@/data-source';
import { ImageOfPost } from '@/entity/ImageOfPost';
import { Gender, User } from '@/entity/User';

const userRepository = AppDataSource.getRepository(User);
const imageOfPostRepository = AppDataSource.getRepository(ImageOfPost);

class UserService {
    async findUserById(id: string): Promise<User | null> {
        return await userRepository.findOneBy({
            id,
        });
    }

    async getUserFields({ userId, fields }: { userId: string; fields: string[] }): Promise<User | null> {
        const obj = Object.fromEntries(fields.map((field) => [field, true]));
        return await userRepository.findOne({
            where: { id: userId },
            select: obj,
        });
    }

    async changeInformation({
        userId,
        userInfo,
    }: {
        userId: string;
        userInfo: {
            firstName?: string;
            lastName?: string;
            birthday?: Date;
            gender?: Gender;
            hometown?: string;
            school?: string;
            workplace?: string;
            avatar?: string;
            isPrivate?: boolean;
        };
    }): Promise<void> {
        await userRepository.update(
            {
                id: userId,
            },
            {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                birthday: userInfo.birthday,
                gender: userInfo.gender,
                hometown: userInfo.hometown,
                school: userInfo.school,
                workplace: userInfo.workplace,
                avatar: userInfo.avatar,
                isPrivate: userInfo.isPrivate,
            },
        );
    }

    async getUserImages(userId: string): Promise<any> {
        return await imageOfPostRepository
            .createQueryBuilder('image')
            .select(['image.postId as postId', 'image.imageUrl as imageUrl'])
            .innerJoin('image.post', 'post')
            .where('post.posterId = :userId', { userId })
            .groupBy('image.imageUrl')
            .getRawMany();
    }
}

export const userService = new UserService();
