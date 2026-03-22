import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Delete, 
    Param, 
    Body, 
    Query, 
    ParseIntPipe 
} from '@nestjs/common'
import { CalendarEventsService } from './calendar-events.service'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'
import { EventType, EventStatus } from '../@types/enums'
import { Public } from '../auth/public.decorator'

@Public()   
@Controller('calendar-events')
export class CalendarEventsController {
    constructor(private readonly calendarEventsService: CalendarEventsService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    async create(@Body() data: CreateCalendarEventDto) {
        return this.calendarEventsService.create(data)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.calendarEventsService.findAll()
    }

    /*
    |----------------------------------------------------------------------
    | PAGINATED SEARCH AVEC FILTRES
    |----------------------------------------------------------------------
    */
    @Get('paginate')
    async paginate(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
        @Query('title') title?: string,
        @Query('type') type?: EventType,
        @Query('startTime') startTime?: string,
        @Query('endTime') endTime?: string,
        @Query('participants') participants?: string, // attendu comme CSV : "id1,id2"
        @Query('location') location?: string,
        @Query('status') status?: EventStatus,
    ) {
        const filters: any = {}

        if (title) filters.title = title
        if (type) filters.type = type
        if (startTime) filters.startTime = startTime
        if (endTime) filters.endTime = endTime
        if (participants) filters.participants = participants.split(',') // conversion CSV -> tableau
        if (location) filters.location = location
        if (status) filters.status = status

        return this.calendarEventsService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.calendarEventsService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: UpdateCalendarEventDto) {
        return this.calendarEventsService.update(id, data)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.calendarEventsService.remove(id)
    }
}