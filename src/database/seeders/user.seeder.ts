import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../users/user.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '../../@types/enums';

export default class UserSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<any> {
        const userRepository = dataSource.getRepository(User);

        const users: Partial<User>[] = [];

        for (let i = 0; i < 20; i++) {
            const password = await bcrypt.hash('password123', 10);

            users.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password,
                role: i === 0 ? UserRole.ADMIN : UserRole.USER,
                status: UserStatus.ACTIVE,
                avatar: faker.image.avatar(),
            });
        }

        await userRepository.insert(users);

        console.log('✅ Users seeded successfully');
    }
}