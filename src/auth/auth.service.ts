import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
    private tokenBlacklist = new Set<string>(); // blacklist en mémoire

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findAll().then(users =>
            users.find(u => u.email === email),
        );
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        return {
            access_token: token,
            user,
        };
    }

    async logout(token: string) {
        this.tokenBlacklist.add(token);
        return { message: 'Logged out successfully' };
    }

    isTokenBlacklisted(token: string): boolean {
        return this.tokenBlacklist.has(token);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }
}