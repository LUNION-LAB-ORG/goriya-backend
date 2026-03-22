import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ScoringResult } from './scoring-result.entity'
import { ScoringStatus } from 'src/@types/enums'
import { CreateScoringResultDto } from './dto/create-scoring-result.dto'
import { UpdateScoringResultDto } from './dto/update-scoring-result.dto'

@Injectable()
export class ScoringResultsService {
    constructor(
        @InjectRepository(ScoringResult)
        private readonly scoringResultRepository: Repository<ScoringResult>,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateScoringResultDto): Promise<ScoringResult> {
        const result = this.scoringResultRepository.create(data)
        return await this.scoringResultRepository.save(result)
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<ScoringResult[]> {
        return await this.scoringResultRepository.find()
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<ScoringResult> {
        const result = await this.scoringResultRepository.findOne({ where: { id } })
        if (!result) throw new NotFoundException('ScoringResult not found')
        return result
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateScoringResultDto): Promise<ScoringResult> {
        const result = await this.findOne(id)
        Object.assign(result, data)
        return await this.scoringResultRepository.save(result)
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const result = await this.findOne(id)
        await this.scoringResultRepository.remove(result)
        return { message: 'ScoringResult deleted successfully' }
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
            overallScore?: number
            analysisDate?: string // yyyy-mm-dd
            status?: ScoringStatus
        }
    ) {
        const query = this.scoringResultRepository.createQueryBuilder('scoring')

        if (filters) {
            if (filters.candidateName) {
                query.andWhere('scoring.candidateName ILIKE :candidateName', { candidateName: `%${filters.candidateName}%` })
            }
            if (filters.candidateEmail) {
                query.andWhere('scoring.candidateEmail ILIKE :candidateEmail', { candidateEmail: `%${filters.candidateEmail}%` })
            }
            if (filters.position) {
                query.andWhere('scoring.position ILIKE :position', { position: `%${filters.position}%` })
            }
            if (filters.overallScore !== undefined) {
                query.andWhere('scoring.overallScore = :overallScore', { overallScore: filters.overallScore })
            }
            if (filters.analysisDate) {
                query.andWhere('DATE(scoring.analysisDate) = :date', { date: filters.analysisDate })
            }
            if (filters.status) {
                query.andWhere('scoring.status = :status', { status: filters.status })
            }
        }

        query.orderBy('scoring.analysisDate', 'DESC')
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