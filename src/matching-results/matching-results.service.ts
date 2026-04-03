import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchingResult } from './matching-result.entity'
import { MatchingStatus } from '../@types/enums'
import { UpdateMatchingResultDto } from './dto/update-matching-result.dto'
import { CreateMatchingResultDto } from './dto/create-matching-result.dto'
import { MatchingResultVm } from './dto/matching-result.vm'

@Injectable()
export class MatchingResultsService {
    constructor(
        @InjectRepository(MatchingResult)
        private readonly matchingResultRepository: Repository<MatchingResult>,
    ) {}

    private toVm(entity: MatchingResult): MatchingResultVm {
        return new MatchingResultVm({
            id: entity.id,
            candidateName: entity.candidateName,
            candidateEmail: entity.candidateEmail,
            position: entity.position,
            company: entity.company,
            matchingScore: entity.matchingScore,
            status: entity.status,
            matchDate: entity.matchDate,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        })
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateMatchingResultDto): Promise<MatchingResultVm> {
        try {
            const result = this.matchingResultRepository.create(data)
            return this.toVm(await this.matchingResultRepository.save(result))
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
    async findAll(): Promise<MatchingResultVm[]> {
        const results = await this.matchingResultRepository.find()
        return results.map(r => this.toVm(r))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<MatchingResultVm> {
        const result = await this.matchingResultRepository.findOne({ where: { id } })
        if (!result) throw new NotFoundException('MatchingResult not found')
        return this.toVm(result)
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateMatchingResultDto): Promise<MatchingResultVm> {
        try {
            const result = await this.matchingResultRepository.findOne({ where: { id } })
            if (!result) throw new NotFoundException('MatchingResult not found')
            Object.assign(result, data)
            return this.toVm(await this.matchingResultRepository.save(result))
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
            const result = await this.matchingResultRepository.findOne({ where: { id } })
            if (!result) throw new NotFoundException('MatchingResult not found')
            await this.matchingResultRepository.remove(result)
            return { message: 'MatchingResult deleted successfully' }
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