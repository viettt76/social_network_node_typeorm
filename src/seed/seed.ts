import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User, Role } from '../entity/User';
import users from './users.json';

async function seed() {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const hashPassword = bcrypt.hashSync('Abcd123!', 10);

    for (const user of users) {
        const existingType = await userRepository.findOne({
            where: { username: user.username },
        });
        if (!existingType) {
            const newUser: Partial<User> = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                password: hashPassword,
                role: user.role ? (user.role as Role) : Role.USER,
            };

            await userRepository.save(newUser);
        }
    }

    await AppDataSource.destroy();
}

seed()
    .then(() => {
        console.log('Seed completed!');
    })
    .catch((error) => {
        console.error('Error seeding data:', error);
    });
