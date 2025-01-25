import { AppDataSource } from '@/data-source';
import { User } from '@/entity/User';

const userRepository = AppDataSource.getRepository(User);

class UserService {
    async findUserById(id: string): Promise<User | null> {
        return await userRepository.findOneBy({
            id,
        });
    }
}

export const userService = new UserService();
