import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || '147.79.101.226',
    port: 5432,
    username: process.env.DB_USERNAME || 'turbo',
    password: process.env.DB_PASSWORD || 'turbo',
    database: process.env.DB_DATABASE || 'goriya',
    autoLoadEntities: true,
    synchronize: true
}