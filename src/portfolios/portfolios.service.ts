import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Portfolio } from './portfolio.entity'
import { UpdatePortfolioDto } from './dto/update-portfolio.dto'
import { CreatePortfolioDto } from './dto/create-portfolio.dto'
import { PortfolioVm } from './dto/portfolio.vm'
import { UserVm } from '../users/dto/user.vm'

@Injectable()
export class PortfoliosService {
    constructor(
        @InjectRepository(Portfolio)
        private readonly portfolioRepository: Repository<Portfolio>,
    ) {}

    private toVm(entity: Portfolio): PortfolioVm {
        return new PortfolioVm({
            id: entity.id,
            title: entity.title,
            description: entity.description,
            skills: entity.skills,
            views: entity.views,
            downloads: entity.downloads,
            likes: entity.likes,
            createdDate: entity.createdDate,
            user: entity.user ? new UserVm({ id: entity.user.id, name: entity.user.name, email: entity.user.email }) : null,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        })
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreatePortfolioDto): Promise<PortfolioVm> {
        try {
            const portfolio = this.portfolioRepository.create(data)
            return this.toVm(await this.portfolioRepository.save(portfolio))
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
    async findAll(): Promise<PortfolioVm[]> {
        const portfolios = await this.portfolioRepository.find({ relations: ['user'] })
        return portfolios.map(p => this.toVm(p))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<PortfolioVm> {
        const portfolio = await this.portfolioRepository.findOne({ where: { id }, relations: ['user'] })
        if (!portfolio) throw new NotFoundException('Portfolio not found')
        return this.toVm(portfolio)
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdatePortfolioDto): Promise<PortfolioVm> {
        try {
            const portfolio = await this.portfolioRepository.findOne({ where: { id }, relations: ['user'] })
            if (!portfolio) throw new NotFoundException('Portfolio not found')
            Object.assign(portfolio, data)
            return this.toVm(await this.portfolioRepository.save(portfolio))
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
            const portfolio = await this.portfolioRepository.findOne({ where: { id } })
            if (!portfolio) throw new NotFoundException('Portfolio not found')
            await this.portfolioRepository.remove(portfolio)
            return { message: 'Portfolio deleted successfully' }
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
            title?: string
            description?: string
            skills?: string[] // recherche si au moins un skill correspond
            views?: number
            downloads?: number
            likes?: number
            createdDate?: string // yyyy-mm-dd
            userId?: string
        }
    ) {
        const query = this.portfolioRepository.createQueryBuilder('portfolio')
            .leftJoinAndSelect('portfolio.user', 'user')

        if (filters) {
            if (filters.title) {
                query.andWhere('portfolio.title ILIKE :title', { title: `%${filters.title}%` })
            }
            if (filters.description) {
                query.andWhere('portfolio.description ILIKE :description', { description: `%${filters.description}%` })
            }
            if (filters.skills && filters.skills.length > 0) {
                query.andWhere('portfolio.skills && :skills', { skills: filters.skills })
            }
            if (filters.views !== undefined) {
                query.andWhere('portfolio.views = :views', { views: filters.views })
            }
            if (filters.downloads !== undefined) {
                query.andWhere('portfolio.downloads = :downloads', { downloads: filters.downloads })
            }
            if (filters.likes !== undefined) {
                query.andWhere('portfolio.likes = :likes', { likes: filters.likes })
            }
            if (filters.createdDate) {
                query.andWhere('DATE(portfolio.createdDate) = :date', { date: filters.createdDate })
            }
            if (filters.userId) {
                query.andWhere('user.id = :userId', { userId: filters.userId })
            }
        }

        query.orderBy('portfolio.createdDate', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)

        const [data, total] = await query.getManyAndCount()

        return {
            data: data.map(p => this.toVm(p)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}