import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Candidature } from './candidature.entity'
import { CandidatureStatus } from '../@types/enums'
import { CreateCandidatureDto } from './dto/create-candidature.dto'
import { UpdateCandidatureDto } from './dto/update-candidature.dto'
import { CandidatureVm } from './dto/candidature.vm'
import { UserVm } from '../users/dto/user.vm'
import { JobOfferVm } from '../job-offers/dto/job-offer.vm'

@Injectable()
export class CandidaturesService {
    constructor(
        @InjectRepository(Candidature)
        private readonly candidatureRepository: Repository<Candidature>,
    ) {}

    private toVm(entity: Candidature): CandidatureVm {
        return new CandidatureVm({
            id: entity.id,
            candidateName: entity.candidateName,
            candidateEmail: entity.candidateEmail,
            status: entity.status,
            score: entity.score,
            appliedDate: entity.appliedDate,
            user: entity.user ? new UserVm({ id: entity.user.id, name: entity.user.name, email: entity.user.email }) : null,
            jobOffer: entity.jobOffer ? new JobOfferVm({ id: entity.jobOffer.id, title: entity.jobOffer.title }) : null,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        })
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateCandidatureDto): Promise<CandidatureVm> {
        try {
            const candidature = this.candidatureRepository.create(data)
            return this.toVm(await this.candidatureRepository.save(candidature))
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
    async findAll(): Promise<CandidatureVm[]> {
        const candidatures = await this.candidatureRepository.find({ relations: ['user', 'jobOffer'] })
        return candidatures.map(c => this.toVm(c))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<CandidatureVm> {
        const candidature = await this.candidatureRepository.findOne({ where: { id }, relations: ['user', 'jobOffer'] })
        if (!candidature) throw new NotFoundException('Candidature not found')
        return this.toVm(candidature)
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateCandidatureDto): Promise<CandidatureVm> {
        try {
            const candidature = await this.candidatureRepository.findOne({ where: { id }, relations: ['user', 'jobOffer'] })
            if (!candidature) throw new NotFoundException('Candidature not found')
            Object.assign(candidature, data)
            return this.toVm(await this.candidatureRepository.save(candidature))
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
            const candidature = await this.candidatureRepository.findOne({ where: { id } })
            if (!candidature) throw new NotFoundException('Candidature not found')
            await this.candidatureRepository.remove(candidature)
            return { message: 'Candidature deleted successfully' }
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
            data: data.map(c => this.toVm(c)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}