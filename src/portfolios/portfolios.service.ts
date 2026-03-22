import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Portfolio } from './portfolio.entity'
import { UpdatePortfolioDto } from './dto/update-portfolio.dto'
import { CreatePortfolioDto } from './dto/create-portfolio.dto'

@Injectable()
export class PortfoliosService {
    constructor(
        @InjectRepository(Portfolio)
        private readonly portfolioRepository: Repository<Portfolio>,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreatePortfolioDto): Promise<Portfolio> {
        const portfolio = this.portfolioRepository.create(data)
        return await this.portfolioRepository.save(portfolio)
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<Portfolio[]> {
        return await this.portfolioRepository.find({
            relations: ['user']
        })
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<Portfolio> {
        const portfolio = await this.portfolioRepository.findOne({
            where: { id },
            relations: ['user']
        })
        if (!portfolio) throw new NotFoundException('Portfolio not found')
        return portfolio
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdatePortfolioDto): Promise<Portfolio> {
        const portfolio = await this.findOne(id)
        Object.assign(portfolio, data)
        return await this.portfolioRepository.save(portfolio)
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const portfolio = await this.findOne(id)
        await this.portfolioRepository.remove(portfolio)
        return { message: 'Portfolio deleted successfully' }
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