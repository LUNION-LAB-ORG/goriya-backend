import 'dotenv/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT) || 5432,
    username: requireEnv('DB_USERNAME'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_DATABASE'),
    autoLoadEntities: true,
    // Ne jamais synchroniser automatiquement le schéma en dehors du développement local :
    // des migrations existent déjà (src/database/migrations, migrations.sql) et doivent piloter la prod.
    synchronize: process.env.NODE_ENV !== 'production',
}