import { Controller, Post, Body, Headers, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Connexion utilisateur' })
    @ApiBody({
        schema: {
            example: {
                email: "user@email.com",
                password: "password123"
            }
        }
    })
    async login(
        @Body() body: { email: string; password: string },
    ): Promise<{ access_token: string; user: User }> {
        const { email, password } = body;
        return this.authService.login(email, password);
    }

    @Public()
    @Post('logout')
    @ApiOperation({ summary: 'Déconnexion utilisateur' })
    async logout(@Headers('Authorization') authHeader: string) {
        if (!authHeader) return { message: 'No token provided' };
        const token = authHeader.replace('Bearer ', '');
        return this.authService.logout(token);
    }

    @Get('profile')
    getProfile(@CurrentUser() user) {
        return user;
    }
}