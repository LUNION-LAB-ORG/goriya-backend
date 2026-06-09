import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AnalyticsService } from '../analytics/analytics.service';
import { success } from './admin-response';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
export class AdminAnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get()
    async getAnalytics() {
        return success(await this.analyticsService.getAnalytics());
    }

    @Get('evolution')
    @ApiQuery({ name: 'period', required: true, enum: ['week', 'month', 'year'] })
    async getEvolutionData(@Query('period') period: 'week' | 'month' | 'year') {
        return success(await this.analyticsService.getEvolutionData(period));
    }

    @Get('activity')
    async getActivityDistribution() {
        return success(await this.analyticsService.getActivityDistribution());
    }

    @Get('kpis')
    async getKPIs() {
        return success(await this.analyticsService.getKPIs());
    }

    @Get('export')
    @ApiQuery({ name: 'period', required: true, type: String })
    @ApiQuery({ name: 'format', required: false, type: String })
    async exportReport(
        @Query('period') period: string,
        @Query('format') format = 'csv',
        @Res() res: Response,
    ) {
        const buffer = await this.analyticsService.exportReport(period);
        const normalizedFormat = format === 'pdf' ? 'pdf' : 'csv';
        const filename = `analytics-report-${period}.${normalizedFormat}`;

        res.set({
            'Content-Type': normalizedFormat === 'pdf' ? 'application/pdf' : 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    }
}