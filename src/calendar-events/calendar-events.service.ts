import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CalendarEvent } from './calendar-event.entity'
import { EventType, EventStatus } from 'src/@types/enums'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'

@Injectable()
export class CalendarEventsService {
    constructor(
        @InjectRepository(CalendarEvent)
        private readonly calendarEventRepository: Repository<CalendarEvent>,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateCalendarEventDto): Promise<CalendarEvent> {
        const event = this.calendarEventRepository.create(data)
        return await this.calendarEventRepository.save(event)
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<CalendarEvent[]> {
        return await this.calendarEventRepository.find()
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<CalendarEvent> {
        const event = await this.calendarEventRepository.findOne({ where: { id } })
        if (!event) throw new NotFoundException('CalendarEvent not found')
        return event
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
        const event = await this.findOne(id)
        Object.assign(event, data)
        return await this.calendarEventRepository.save(event)
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const event = await this.findOne(id)
        await this.calendarEventRepository.remove(event)
        return { message: 'CalendarEvent deleted successfully' }
    }

    /*
    |--------------------------------------------------------------------------
    | PAGINATED SEARCH PAR COLONNES OPTIONNELLES
    |--------------------------------------------------------------------------
    */
    async paginate(
        page: number = 1,
        limit: number = 10,
        filters?: {
            title?: string
            type?: EventType
            startTime?: string // yyyy-mm-dd
            endTime?: string // yyyy-mm-dd
            participants?: string[] // recherche si au moins un participant correspond
            location?: string
            status?: EventStatus
        }
    ) {
        const query = this.calendarEventRepository.createQueryBuilder('event')

        if (filters) {
            if (filters.title) {
                query.andWhere('event.title ILIKE :title', { title: `%${filters.title}%` })
            }
            if (filters.type) {
                query.andWhere('event.type = :type', { type: filters.type })
            }
            if (filters.startTime) {
                query.andWhere('DATE(event.startTime) = :start', { start: filters.startTime })
            }
            if (filters.endTime) {
                query.andWhere('DATE(event.endTime) = :end', { end: filters.endTime })
            }
            if (filters.participants && filters.participants.length > 0) {
                query.andWhere('event.participants && :participants', { participants: filters.participants })
            }
            if (filters.location) {
                query.andWhere('event.location ILIKE :location', { location: `%${filters.location}%` })
            }
            if (filters.status) {
                query.andWhere('event.status = :status', { status: filters.status })
            }
        }

        query.orderBy('event.startTime', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)

        const [data, total] = await query.getManyAndCount()

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}