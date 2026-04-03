import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CalendarEvent } from './calendar-event.entity'
import { EventType, EventStatus } from '../@types/enums'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'
import { CalendarEventVm } from './dto/calendar-event.vm'

@Injectable()
export class CalendarEventsService {
    constructor(
        @InjectRepository(CalendarEvent)
        private readonly calendarEventRepository: Repository<CalendarEvent>,
    ) {}

    private toVm(entity: CalendarEvent): CalendarEventVm {
        return new CalendarEventVm({
            id: entity.id,
            title: entity.title,
            type: entity.type,
            startTime: entity.startTime,
            endTime: entity.endTime,
            participants: entity.participants,
            location: entity.location ?? null,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        })
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateCalendarEventDto): Promise<CalendarEventVm> {
        try {
            const event = this.calendarEventRepository.create(data)
            return this.toVm(await this.calendarEventRepository.save(event))
        } catch (error) {
            const err = error as any;
            if (err.code === '23505') throw new BadRequestException('Valeur unique déjà utilisée');
            throw new InternalServerErrorException(err.message || 'Erreur interne lors de la création');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<CalendarEventVm[]> {
        const events = await this.calendarEventRepository.find()
        return events.map(e => this.toVm(e))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<CalendarEventVm> {
        const event = await this.calendarEventRepository.findOne({ where: { id } })
        if (!event) throw new NotFoundException('CalendarEvent not found')
        return this.toVm(event)
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateCalendarEventDto): Promise<CalendarEventVm> {
        try {
            const event = await this.calendarEventRepository.findOne({ where: { id } })
            if (!event) throw new NotFoundException('CalendarEvent not found')
            Object.assign(event, data)
            return this.toVm(await this.calendarEventRepository.save(event))
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            const err = error as any;
            if (err.code === '23505') throw new BadRequestException('Valeur unique déjà utilisée');
            throw new InternalServerErrorException(err.message || 'Erreur interne lors de la mise à jour');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        try {
            const event = await this.calendarEventRepository.findOne({ where: { id } })
            if (!event) throw new NotFoundException('CalendarEvent not found')
            await this.calendarEventRepository.remove(event)
            return { message: 'CalendarEvent deleted successfully' }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException((error as any).message || 'Erreur interne lors de la suppression');
        }
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
            data: data.map(e => this.toVm(e)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}