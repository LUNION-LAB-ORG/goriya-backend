import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UserStatus } from '../@types/enums';

@Injectable()
export class AuthService {
    private tokenBlacklist = new Set<string>(); // blacklist en mémoire

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findByEmailWithPassword(email);
    
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
    
        const passwordMatch = await bcrypt.compare(password, user.password);    
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status === UserStatus.INACTIVE) {
            throw new UnauthorizedException('Compte bloqué. Vous n\'êtes pas autorisé à vous connecter. Veuillez contacter l\'administrateur.');
        }

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
    
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
    
        // 🔥 récupérer le user complet (sans password grâce à @Exclude)
        const fullUser = await this.usersService.findOne(user.id);
    
        return {
            access_token: token,
            user: fullUser,
        };
    }

    async logout(token: string) {
        this.tokenBlacklist.add(token);
        return { message: 'Logged out successfully' };
    }

    async refresh(user: { id: string; email: string; role: string }): Promise<{ token: string }> {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return { token: this.jwtService.sign(payload) };
    }

    isTokenBlacklisted(token: string): boolean {
        return this.tokenBlacklist.has(token);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }
}