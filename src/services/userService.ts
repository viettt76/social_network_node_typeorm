import { AppDataSource } from '@/data-source';
import { User } from '@/entity/User';

const userRepository = AppDataSource.getRepository(User);

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
}

export const userService = new UserService();
