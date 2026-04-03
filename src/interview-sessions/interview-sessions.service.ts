import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InterviewSession } from './interview-session.entity'
import { InterviewStatus } from '../@types/enums'
import { UpdateInterviewSessionDto } from './dto/update-interview-session.dto'
import { CreateInterviewSessionDto } from './dto/create-interview-session.dto'
import { InterviewSessionVm } from './dto/interview-session.vm'

@Injectable()
export class InterviewSessionsService {
    constructor(
        @InjectRepository(InterviewSession)
        private readonly interviewSessionRepository: Repository<InterviewSession>,
    ) {}

    private toVm(entity: InterviewSession): InterviewSessionVm {
        return new InterviewSessionVm({
            id: entity.id,
            candidateName: entity.candidateName,
            candidateEmail: entity.candidateEmail,
            position: entity.position,
            duration: entity.duration,
            score: entity.score,
            status: entity.status,
            startTime: entity.startTime,
            feedback: entity.feedback,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        })
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateInterviewSessionDto): Promise<InterviewSessionVm> {
        const session = this.interviewSessionRepository.create(data)
        return this.toVm(await this.interviewSessionRepository.save(session))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<InterviewSessionVm[]> {
        const sessions = await this.interviewSessionRepository.find()
        return sessions.map(s => this.toVm(s))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<InterviewSessionVm> {
        const session = await this.interviewSessionRepository.findOne({ where: { id } })
        if (!session) throw new NotFoundException('InterviewSession not found')
        return this.toVm(session)
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateInterviewSessionDto): Promise<InterviewSessionVm> {
        const session = await this.interviewSessionRepository.findOne({ where: { id } })
        if (!session) throw new NotFoundException('InterviewSession not found')
        Object.assign(session, data)
        return this.toVm(await this.interviewSessionRepository.save(session))
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const session = await this.interviewSessionRepository.findOne({ where: { id } })
        if (!session) throw new NotFoundException('InterviewSession not found')
        await this.interviewSessionRepository.remove(session)
        return { message: 'InterviewSession deleted successfully' }
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
            candidateName?: string
            candidateEmail?: string
            position?: string
            duration?: number
            score?: number
            status?: InterviewStatus
            startTime?: string // yyyy-mm-dd
        }
    ) {
        const query = this.interviewSessionRepository.createQueryBuilder('session')

        if (filters) {
            if (filters.candidateName) {
                query.andWhere('session.candidateName ILIKE :candidateName', { candidateName: `%${filters.candidateName}%` })
            }
            if (filters.candidateEmail) {
                query.andWhere('session.candidateEmail ILIKE :candidateEmail', { candidateEmail: `%${filters.candidateEmail}%` })
            }
            if (filters.position) {
                query.andWhere('session.position ILIKE :position', { position: `%${filters.position}%` })
            }
            if (filters.duration !== undefined) {
                query.andWhere('session.duration = :duration', { duration: filters.duration })
            }
            if (filters.score !== undefined) {
                query.andWhere('session.score = :score', { score: filters.score })
            }
            if (filters.status) {
                query.andWhere('session.status = :status', { status: filters.status })
            }
            if (filters.startTime) {
                query.andWhere('DATE(session.startTime) = :date', { date: filters.startTime })
            }
        }

        query.orderBy('session.startTime', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)

        const [data, total] = await query.getManyAndCount()

        return {
            data: data.map(s => this.toVm(s)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}