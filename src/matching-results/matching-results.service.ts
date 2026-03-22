import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchingResult } from './matching-result.entity'
import { MatchingStatus } from '../@types/enums'
import { UpdateMatchingResultDto } from './dto/update-matching-result.dto'
import { CreateMatchingResultDto } from './dto/create-matching-result.dto'

@Injectable()
export class MatchingResultsService {
    constructor(
        @InjectRepository(MatchingResult)
        private readonly matchingResultRepository: Repository<MatchingResult>,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateMatchingResultDto): Promise<MatchingResult> {
        const result = this.matchingResultRepository.create(data)
        return await this.matchingResultRepository.save(result)
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<MatchingResult[]> {
        return await this.matchingResultRepository.find()
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<MatchingResult> {
        const result = await this.matchingResultRepository.findOne({ where: { id } })
        if (!result) throw new NotFoundException('MatchingResult not found')
        return result
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateMatchingResultDto): Promise<MatchingResult> {
        const result = await this.findOne(id)
        Object.assign(result, data)
        return await this.matchingResultRepository.save(result)
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const result = await this.findOne(id)
        await this.matchingResultRepository.remove(result)
        return { message: 'MatchingResult deleted successfully' }
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
            company?: string
            matchingScore?: number
            status?: MatchingStatus
            matchDate?: string // yyyy-mm-dd
        }
    ) {
        const query = this.matchingResultRepository.createQueryBuilder('matching')

        if (filters) {
            if (filters.candidateName) {
                query.andWhere('matching.candidateName ILIKE :candidateName', { candidateName: `%${filters.candidateName}%` })
            }
            if (filters.candidateEmail) {
                query.andWhere('matching.candidateEmail ILIKE :candidateEmail', { candidateEmail: `%${filters.candidateEmail}%` })
            }
            if (filters.position) {
                query.andWhere('matching.position ILIKE :position', { position: `%${filters.position}%` })
            }
            if (filters.company) {
                query.andWhere('matching.company ILIKE :company', { company: `%${filters.company}%` })
            }
            if (filters.matchingScore !== undefined) {
                query.andWhere('matching.matchingScore = :matchingScore', { matchingScore: filters.matchingScore })
            }
            if (filters.status) {
                query.andWhere('matching.status = :status', { status: filters.status })
            }
            if (filters.matchDate) {
                query.andWhere('DATE(matching.matchDate) = :date', { date: filters.matchDate })
            }
        }

        query.orderBy('matching.matchDate', 'DESC')
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