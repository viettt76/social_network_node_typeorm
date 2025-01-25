import { AppDataSource } from '@/data-source';
import { Gender, User } from '@/entity/User';
import { Not, IsNull } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);

class AuthService {
    async findUserByUsername(username: string): Promise<User | null> {
        return await userRepository.findOne({
            where: { username },
        });
    }

    async findUserEvenDeleted(username: string): Promise<User | null> {
        return await userRepository.findOne({
            where: {
                username,
                deletedAt: Not(IsNull()),
            },
            withDeleted: true,
        });
    }

    async createUser(userData: {
        firstName: string;
        lastName: string;
        username: string;
        gender: Gender;
        password: string;
    }): Promise<void> {
        const { firstName, lastName, username, password, gender } = userData;

        await userRepository.save({
            firstName,
            lastName,
            username,
            gender,
            password,
        });
    }
}

export const authService = new AuthService();
