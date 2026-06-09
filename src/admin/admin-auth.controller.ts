import { Body, Controller, Get, Headers, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { UsersService } from '../users/users.service';
import { AdminPlatformService } from './admin-platform.service';
import { success } from './admin-response';
import type { UploadedFile as MulterFile } from '../@types/utils';

@ApiTags('Admin Auth')
@Controller('admin')
export class AdminAuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly adminPlatformService: AdminPlatformService,
        private readonly jwtService: JwtService,
    ) {}

    @Public()
    @Post('auth/login')
    async login(@Body() body: { email: string; password: string }) {
        return success(await this.authService.login(body.email, body.password));
    }

    @Public()
    @Post('users')
    async register(@Body() body: Record<string, unknown>) {
        const result = await this.usersService.create(body as never);
        return success({ token: result.accessToken, user: result.user });
    }

    @Public()
    @Post('auth/logout')
    async logout(@Headers('authorization') authHeader?: string) {
        const token = authHeader?.replace('Bearer ', '') || '';
        const result = await this.authService.logout(token);
        return success(null, result.message);
    }

    @Post('auth/refresh')
    async refresh(@CurrentUser() user: { id: string; email: string; role: string }) {
        return success(await this.authService.refresh(user));
    }

    @Public()
    @Post('auth/verify-otp')
    async verifyOtp(@Body() body: { email: string; code: string }) {
        return success(await this.adminPlatformService.verifyOtp(body.email, body.code));
    }

    @Public()
    @Post('auth/google')
    async googleLogin(@Body() body: { email: string; name?: string; firstName?: string; lastName?: string }) {
        return success(await this.adminPlatformService.loginWithGoogle(body));
    }

    @Get('auth/profile')
    async getProfile(@CurrentUser() user: { id: string }) {
        return success(await this.usersService.findOne(user.id));
    }

    @Put('user/profile')
    async updateProfile(@CurrentUser() user: { id: string }, @Body() body: Record<string, unknown>) {
        return success(await this.adminPlatformService.updateMyProfile(user.id, body));
    }

    @Post('user/avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async uploadAvatar(@CurrentUser() user: { id: string }, @UploadedFile() avatar: MulterFile) {
        return success(await this.adminPlatformService.uploadMyAvatar(user.id, avatar));
    }
}