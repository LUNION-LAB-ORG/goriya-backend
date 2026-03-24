import { Repository } from 'typeorm'
import { JobOffer } from './job-offer.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { JobStatus, JobType } from '../@types/enums'
import { Company } from '../companies/company.entity'
import { UpdateJobOfferDto } from './dto/update-job-offer.dto'
import { CreateJobOfferDto } from './dto/create-job-offer.dto'
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'

@Injectable()
export class JobOffersService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepository: Repository<JobOffer>,

        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateJobOfferDto): Promise<JobOffer> {
        try {
            // Vérifie si la company existe
            const company = await this.companyRepository.findOne({
                where: { id: data.companyId },
            });
            if (!company) {
                throw new NotFoundException(`Company with id ${data.companyId} not found`);
            }

            // Crée l'entité JobOffer
            const jobOffer = this.jobOfferRepository.create({
                ...data,
                company, // Si tu as une relation ManyToOne
            });

            // Sauvegarde dans la DB
            return await this.jobOfferRepository.save(jobOffer);
        } catch (error) {
            console.error('Erreur création JobOffer:', error);

            // Gestion des erreurs spécifiques
            if (error.name === 'QueryFailedError') {
                throw new BadRequestException('Données invalides pour créer le JobOffer');
            }

            throw new InternalServerErrorException('Erreur interne lors de la création du JobOffer');
        }
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
        try {
            // Vérifie que le JobOffer existe
            const jobOffer = await this.findOne(id);
            if (!jobOffer) {
                throw new NotFoundException(`JobOffer with id ${id} not found`);
            }
    
            // Met à jour les propriétés
            Object.assign(jobOffer, data);
    
            // Sauvegarde dans la DB
            return await this.jobOfferRepository.save(jobOffer);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du JobOffer ${id}:`, error);
    
            if (error.name === 'QueryFailedError') {
                throw new BadRequestException('Données invalides pour mettre à jour le JobOffer');
            }
    
            if (error instanceof NotFoundException) {
                throw error; // On relaie les NotFoundException
            }
    
            throw new InternalServerErrorException('Erreur interne lors de la mise à jour du JobOffer');
        }
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