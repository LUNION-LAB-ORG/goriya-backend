import { Body, Controller, Get, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminPlatformService } from './admin-platform.service';
import { paginated, success } from './admin-response';

@ApiTags('Admin System')
@Controller('admin')
export class AdminSystemController {
    constructor(private readonly adminPlatformService: AdminPlatformService) {}

    @Get('messages/conversations')
    async getConversations() {
        return success(await this.adminPlatformService.getConversations());
    }

    @Get('messages/conversations/:conversationId/messages')
    async getConversationMessages(@Param('conversationId') conversationId: string) {
        return success(await this.adminPlatformService.getConversationMessages(conversationId));
    }

    @Post('messages/conversations/:conversationId/messages')
    async sendConversationMessage(@Param('conversationId') conversationId: string, @Body() body: { content: string }) {
        return success(await this.adminPlatformService.sendConversationMessage(conversationId, body.content));
    }

    @Put('messages/conversations/:conversationId/read')
    async markConversationAsRead(@Param('conversationId') conversationId: string) {
        await this.adminPlatformService.markConversationAsRead(conversationId);
        return success(null);
    }

    @Post('messages/conversations')
    async createConversation(@Body() body: { participantId: string }) {
        return success(await this.adminPlatformService.createConversation(body.participantId));
    }

    @Get('notifications')
    async getNotifications() {
        return success(await this.adminPlatformService.getNotifications());
    }

    @Put('notifications/:notificationId/read')
    async markNotificationAsRead(@Param('notificationId') notificationId: string) {
        await this.adminPlatformService.markNotificationAsRead(notificationId);
        return success(null);
    }

    @Put('notifications/read-all')
    async markAllNotificationsAsRead() {
        await this.adminPlatformService.markAllNotificationsAsRead();
        return success(null);
    }

    @Put('notifications/settings')
    async updateNotificationSettings(@Body() body: { applications?: boolean; emplois?: boolean; recommandations?: boolean }) {
        await this.adminPlatformService.updateNotificationSettings(body);
        return success(null);
    }

    @Get('search')
    async search(@Query() query: Record<string, unknown>) {
        return paginated(await this.adminPlatformService.searchAll(query));
    }

    @Get('search/candidates')
    async searchCandidates(@Query() query: Record<string, unknown>) {
        return paginated(await this.adminPlatformService.searchCandidates(query));
    }

    @Get('search/offers')
    async searchOffers(@Query() query: Record<string, unknown>) {
        return paginated(await this.adminPlatformService.searchOffers(query));
    }

    @Get('search/filters')
    async getSearchFilters() {
        return success(await this.adminPlatformService.getSearchFilters());
    }

    @Get('search/export')
    async exportSearch(@Query() query: Record<string, unknown>, @Res() res: Response) {
        const buffer = await this.adminPlatformService.exportSearchCsv(query);
        res.set({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="search-results.csv"',
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }

    @Get('settings')
    async getSettings() {
        return success(await this.adminPlatformService.getSystemSettings());
    }

    @Patch('settings')
    async updateSettings(@Body() body: Record<string, unknown>) {
        return success(await this.adminPlatformService.updateSystemSettings(body));
    }

    @Get('settings/email')
    async getEmailSettings() {
        return success(await this.adminPlatformService.getEmailSettings());
    }

    @Patch('settings/email')
    async updateEmailSettings(@Body() body: Record<string, unknown>) {
        await this.adminPlatformService.updateEmailSettings(body);
        return success(null);
    }

    @Post('settings/email/test')
    async testEmailSettings() {
        return success(await this.adminPlatformService.testEmailSettings());
    }
}