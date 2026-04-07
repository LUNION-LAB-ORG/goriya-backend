import { Public } from 'src/auth/public.decorator';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Controller, Get, Query } from '@nestjs/common';

@Public()
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    async getStats() {
        return this.dashboardService.getStats();
    }

    @Get('performance')
    @ApiQuery({ name: 'period', required: false, type: String })
    async getPerformanceData(@Query('period') period?: string) {
        return this.dashboardService.getPerformanceData(period);
    }

    @Get('recent-applications')
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecentApplications(@Query('limit') limit = 5) {
        return this.dashboardService.getRecentApplications(+limit);
    }

    @Get('recommended-jobs')
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecommendedJobs(@Query('limit') limit = 6) {
        return this.dashboardService.getRecommendedJobs(+limit);
    }

    @Get('profile-views')
    @ApiQuery({ name: 'days', required: false, type: Number })
    async getProfileViews(@Query('days') days = 30) {
        return this.dashboardService.getProfileViews(+days);
    }
}