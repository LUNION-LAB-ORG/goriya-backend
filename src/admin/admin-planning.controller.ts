import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CalendarEventsService } from '../calendar-events/calendar-events.service';
import { AdminPlatformService } from './admin-platform.service';
import { success } from './admin-response';

@ApiTags('Admin Planning')
@Controller('admin/planning')
export class AdminPlanningController {
    constructor(
        private readonly calendarEventsService: CalendarEventsService,
        private readonly adminPlatformService: AdminPlatformService,
    ) {}

    @Get('stats')
    async getPlanningStats() {
        return success(await this.adminPlatformService.getPlanningStats());
    }

    @Get('events')
    async getEvents(@Query('date') date?: string) {
        return success(await this.adminPlatformService.getPlanningEvents(date));
    }

    @Get('upcoming')
    async getUpcoming(@Query('limit') limit = '5') {
        return success(await this.adminPlatformService.getUpcomingPlanningEvents(Number(limit)));
    }

    @Get('events/:id')
    async getEvent(@Param('id') id: string) {
        return success(await this.calendarEventsService.findOne(id));
    }

    @Post('events')
    async createEvent(@Body() body: Record<string, unknown>) {
        return success(await this.calendarEventsService.create(body as never));
    }

    @Patch('events/:id')
    async updateEvent(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return success(await this.calendarEventsService.update(id, body as never));
    }

    @Delete('events/:id')
    async deleteEvent(@Param('id') id: string) {
        await this.calendarEventsService.remove(id);
        return success(null);
    }
}