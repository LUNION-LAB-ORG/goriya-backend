import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ScoringResult } from './scoring-result.entity'
import { ScoringStatus } from '../@types/enums'
import { CreateScoringResultDto } from './dto/create-scoring-result.dto'
import { UpdateScoringResultDto } from './dto/update-scoring-result.dto'
import { ScoringResultVm } from './dto/scoring-result.vm'

@Injectable()
export class ScoringResultsService {
    constructor(
        @InjectRepository(ScoringResult)
        private readonly scoringResultRepository: Repository<ScoringResult>,
    ) {}

    private toVm(entity: ScoringResult): ScoringResultVm {
        return new ScoringResultVm({
            id: entity.id,
            candidateName: entity.candidateName,
            candidateEmail: entity.candidateEmail,
            position: entity.position,
            overallScore: entity.overallScore,
            criteria: entity.criteria,
            analysisDate: entity.analysisDate,
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
    async create(data: CreateScoringResultDto): Promise<ScoringResultVm> {
        try {
            const result = this.scoringResultRepository.create(data)
            return this.toVm(await this.scoringResultRepository.save(result))
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
    async findAll(): Promise<ScoringResultVm[]> {
        const results = await this.scoringResultRepository.find()
        return results.map(r => this.toVm(r))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<ScoringResultVm> {
        const result = await this.scoringResultRepository.findOne({ where: { id } })
        if (!result) throw new NotFoundException('ScoringResult not found')
        return this.toVm(result)
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateScoringResultDto): Promise<ScoringResultVm> {
        try {
            const result = await this.scoringResultRepository.findOne({ where: { id } })
            if (!result) throw new NotFoundException('ScoringResult not found')
            Object.assign(result, data)
            return this.toVm(await this.scoringResultRepository.save(result))
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
            const result = await this.scoringResultRepository.findOne({ where: { id } })
            if (!result) throw new NotFoundException('ScoringResult not found')
            await this.scoringResultRepository.remove(result)
            return { message: 'ScoringResult deleted successfully' }
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
            data: data.map(r => this.toVm(r)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}