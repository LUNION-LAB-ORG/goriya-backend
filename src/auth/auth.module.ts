import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        UsersModule,
        ConfigModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'F3r9tK2mQ8zLpX1vW7sD6jR0yN4uH8bV',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [JwtModule, AuthService],
})
export class AuthModule { }