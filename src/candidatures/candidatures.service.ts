import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Candidature } from './candidature.entity'
import { CandidatureStatus } from '../@types/enums'
import { CreateCandidatureDto } from './dto/create-candidature.dto'
import { UpdateCandidatureDto } from './dto/update-candidature.dto'

@Injectable()
export class CandidaturesService {
    constructor(
        @InjectRepository(Candidature)
        private readonly candidatureRepository: Repository<Candidature>,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateCandidatureDto): Promise<Candidature> {
        const candidature = this.candidatureRepository.create(data)
        return await this.candidatureRepository.save(candidature)
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<Candidature[]> {
        return await this.candidatureRepository.find({ relations: ['user', 'jobOffer'] })
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<Candidature> {
        const candidature = await this.candidatureRepository.findOne({
            where: { id },
            relations: ['user', 'jobOffer']
        })
        if (!candidature) throw new NotFoundException('Candidature not found')
        return candidature
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateCandidatureDto): Promise<Candidature> {
        const candidature = await this.findOne(id)
        Object.assign(candidature, data)
        return await this.candidatureRepository.save(candidature)
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const candidature = await this.findOne(id)
        await this.candidatureRepository.remove(candidature)
        return { message: 'Candidature deleted successfully' }
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
            status?: CandidatureStatus
            score?: number
            appliedDate?: string // yyyy-mm-dd
            userId?: string
            jobOfferId?: string
        }
    ) {
        const query = this.candidatureRepository.createQueryBuilder('candidature')
            .leftJoinAndSelect('candidature.user', 'user')
            .leftJoinAndSelect('candidature.jobOffer', 'jobOffer')

        if (filters) {
            if (filters.candidateName) {
                query.andWhere('candidature.candidateName ILIKE :candidateName', { candidateName: `%${filters.candidateName}%` })
            }
            if (filters.candidateEmail) {
                query.andWhere('candidature.candidateEmail ILIKE :candidateEmail', { candidateEmail: `%${filters.candidateEmail}%` })
            }
            if (filters.status) {
                query.andWhere('candidature.status = :status', { status: filters.status })
            }
            if (filters.score !== undefined) {
                query.andWhere('candidature.score = :score', { score: filters.score })
            }
            if (filters.appliedDate) {
                query.andWhere('DATE(candidature.appliedDate) = :date', { date: filters.appliedDate })
            }
            if (filters.userId) {
                query.andWhere('user.id = :userId', { userId: filters.userId })
            }
            if (filters.jobOfferId) {
                query.andWhere('jobOffer.id = :jobOfferId', { jobOfferId: filters.jobOfferId })
            }
        }

        query.orderBy('candidature.appliedDate', 'DESC')
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