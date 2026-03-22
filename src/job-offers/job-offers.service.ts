import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JobOffer } from './job-offer.entity'
import { JobStatus, JobType } from '../@types/enums'
import { UpdateJobOfferDto } from './dto/update-job-offer.dto'
import { CreatePortfolioDto } from '../portfolios/dto/create-portfolio.dto'

@Injectable()
export class JobOffersService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepository: Repository<JobOffer>,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreatePortfolioDto): Promise<JobOffer> {
        const jobOffer = this.jobOfferRepository.create(data)
        return await this.jobOfferRepository.save(jobOffer)
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<JobOffer[]> {
        return await this.jobOfferRepository.find({
            relations: ['company', 'candidatures']
        })
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<JobOffer> {
        const jobOffer = await this.jobOfferRepository.findOne({
            where: { id },
            relations: ['company', 'candidatures']
        })
        if (!jobOffer) throw new NotFoundException('JobOffer not found')
        return jobOffer
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateJobOfferDto): Promise<JobOffer> {
        const jobOffer = await this.findOne(id)
        Object.assign(jobOffer, data)
        return await this.jobOfferRepository.save(jobOffer)
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const jobOffer = await this.findOne(id)
        await this.jobOfferRepository.remove(jobOffer)
        return { message: 'JobOffer deleted successfully' }
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
            location?: string
            type?: JobType
            salary?: string
            status?: JobStatus
            companyId?: string
            applicants?: number
        }
    ) {
        const query = this.jobOfferRepository.createQueryBuilder('jobOffer')
            .leftJoinAndSelect('jobOffer.company', 'company')
            .leftJoinAndSelect('jobOffer.candidatures', 'candidatures')

        if (filters) {
            if (filters.title) {
                query.andWhere('jobOffer.title ILIKE :title', { title: `%${filters.title}%` })
            }
            if (filters.location) {
                query.andWhere('jobOffer.location ILIKE :location', { location: `%${filters.location}%` })
            }
            if (filters.type) {
                query.andWhere('jobOffer.type = :type', { type: filters.type })
            }
            if (filters.salary) {
                query.andWhere('jobOffer.salary ILIKE :salary', { salary: `%${filters.salary}%` })
            }
            if (filters.status) {
                query.andWhere('jobOffer.status = :status', { status: filters.status })
            }
            if (filters.companyId) {
                query.andWhere('company.id = :companyId', { companyId: filters.companyId })
            }
            if (filters.applicants !== undefined) {
                query.andWhere('jobOffer.applicants = :applicants', { applicants: filters.applicants })
            }
        }

        query.orderBy('jobOffer.id', 'DESC')
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