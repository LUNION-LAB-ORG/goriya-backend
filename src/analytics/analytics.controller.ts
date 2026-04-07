import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from 'src/auth/public.decorator';
import { AnalyticsService } from './analytics.service';

@Public()
@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get()
    async getAnalytics() {
        return this.analyticsService.getAnalytics();
    }

    @Get('evolution')
    @ApiQuery({ name: 'period', required: true, enum: ['week', 'month', 'year'] })
    async getEvolutionData(@Query('period') period: 'week' | 'month' | 'year') {
        return this.analyticsService.getEvolutionData(period);
    }

    @Get('activity')
    async getActivityDistribution() {
        return this.analyticsService.getActivityDistribution();
    }

    @Get('kpis')
    async getKPIs() {
        return this.analyticsService.getKPIs();
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
        const filename = `analytics-report-${period}.${format === 'pdf' ? 'csv' : format}`;

        res.set({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    }
}
