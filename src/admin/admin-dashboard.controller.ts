import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../dashboard/dashboard.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../@types/enums';
import { success } from './admin-response';

@Roles(UserRole.ADMIN)
@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    async getStats() {
        return success(await this.dashboardService.getStats());
    }

    @Get('performance')
    @ApiQuery({ name: 'period', required: false, type: String })
    async getPerformanceData(@Query('period') period?: string) {
        return success(await this.dashboardService.getPerformanceData(period));
    }

    @Get('recent-applications')
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecentApplications(@Query('limit') limit = '5') {
        return success(await this.dashboardService.getRecentApplications(Number(limit)));
    }

    @Get('recommended-jobs')
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecommendedJobs(@Query('limit') limit = '6') {
        return success(await this.dashboardService.getRecommendedJobs(Number(limit)));
    }

    @Get('profile-views')
    @ApiQuery({ name: 'days', required: false, type: Number })
    async getProfileViews(@Query('days') days = '30') {
        return success(await this.dashboardService.getProfileViews(Number(days)));
    }
}