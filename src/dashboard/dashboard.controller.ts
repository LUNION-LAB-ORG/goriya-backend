import { Public } from 'src/auth/public.decorator';
import { DashboardService } from './dashboard.service';
import { Controller, Get, Query } from '@nestjs/common';

@Public()
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    async getStats(  
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        // parse optional dates
        const startDate = start ? new Date(start) : undefined;
        const endDate = end ? new Date(end) : undefined;

        return this.dashboardService.getStats({ startDate, endDate });
    }
}