import { QueryFailedError, Repository } from 'typeorm'
import { JobOffer } from './job-offer.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { JobStatus, JobType } from '../@types/enums'
import { Company } from '../companies/company.entity'
import { UpdateJobOfferDto } from './dto/update-job-offer.dto'
import { CreateJobOfferDto } from './dto/create-job-offer.dto'
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { JobOfferVm } from './dto/job-offer.vm'
import { CompanyVm } from '../companies/dto/company.vm'

@Injectable()
export class JobOffersService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepository: Repository<JobOffer>,

        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
    ) {}

    private toVm(entity: JobOffer): JobOfferVm {
        return new JobOfferVm({
            id: entity.id,
            title: entity.title,
            location: entity.location,
            type: entity.type,
            experience: entity.experience,
            salary: entity.salary,
            description: entity.description,
            benefits: entity.benefits,
            requirements: entity.requirements,
            status: entity.status,
            publishDate: entity.publishDate,
            endDate: entity.endDate,
            applicants: entity.applicants,
            company: entity.company ? new CompanyVm({ id: entity.company.id, name: entity.company.name }) : null,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        })
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateJobOfferDto): Promise<JobOfferVm> {
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
                publishDate: new Date(data.publishDate),
                endDate: new Date(data.endDate),
                company,
            });

            // Sauvegarde dans la DB
            return this.toVm(await this.jobOfferRepository.save(jobOffer));
        } catch (error) {
            console.error('Erreur création JobOffer:', error);

            // Si c'est une erreur PostgreSQL / TypeORM
            if (error instanceof QueryFailedError) {
                // QueryFailedError vient de typeorm
                console.error('Query SQL :', (error as any).query);
                console.error('Parameters :', (error as any).parameters);
                throw new BadRequestException(`Erreur base de données : ${(error as any).message}`);
            }

            // Gestion des erreurs spécifiques
            if ((error as any).name === 'QueryFailedError') {
                throw new BadRequestException('Données invalides pour créer le JobOffer');
            }

            throw new InternalServerErrorException('Erreur interne lors de la création du JobOffer');
            // Pour toutes les autres erreurs, on peut aussi relayer un message clair
            // throw new BadRequestException(error.message || 'Erreur inconnue');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<JobOfferVm[]> {
        const offers = await this.jobOfferRepository.find({
            relations: ['company', 'candidatures']
        })
        return offers.map(o => this.toVm(o))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<JobOfferVm> {
        const jobOffer = await this.jobOfferRepository.findOne({
            where: { id },
            relations: ['company', 'candidatures']
        })
        if (!jobOffer) throw new NotFoundException('JobOffer not found')
        return this.toVm(jobOffer)
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateJobOfferDto): Promise<JobOfferVm> {
        try {
            const jobOffer = await this.jobOfferRepository.findOne({ where: { id }, relations: ['company'] });
            if (!jobOffer) {
                throw new NotFoundException(`JobOffer with id ${id} not found`);
            }
    
            // Met à jour les propriétés
            Object.assign(jobOffer, data);
    
            // Sauvegarde dans la DB
            return this.toVm(await this.jobOfferRepository.save(jobOffer));
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du JobOffer ${id}:`, error);
    
            if ((error as any).name === 'QueryFailedError') {
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
        const jobOffer = await this.jobOfferRepository.findOne({ where: { id } })
        if (!jobOffer) throw new NotFoundException('JobOffer not found')
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
            data: data.map(o => this.toVm(o)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}