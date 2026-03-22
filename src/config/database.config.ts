import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: 5433,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123456789',
    database: process.env.DB_DATABASE || 'goriya_db',
    autoLoadEntities: true,
    synchronize: true
}