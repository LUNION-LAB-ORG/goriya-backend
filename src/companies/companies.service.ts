import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { Repository } from 'typeorm'
import { Company } from './company.entity'
import { User } from 'src/users/user.entity'
import { UploadedFile } from 'src/@types/utils'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyStatus, UserRole, UserStatus } from 'src/@types/enums'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'

@Injectable()
export class CompaniesService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    private readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    private readonly uploadDir = path.join(__dirname, '../../storage/companies')

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateCompanyDto, logo?: UploadedFile): Promise<Company> {

        const queryRunner = this.companyRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // -------------------------
            // 1. CREATE COMPANY
            // -------------------------
            const companyData: Partial<Company> = { ...data };

            if (logo) {
                companyData.logo = await this.handleLogoUpload(logo);
            }

            const company = queryRunner.manager.create(Company, companyData);
            const savedCompany = await queryRunner.manager.save(company);

            // -------------------------
            // 2. CREATE USER ENTERPRISE
            // -------------------------
            const enterpriseUser = queryRunner.manager.create(User, {
                name: data.name, // ou un champ spécifique (ex: adminName)
                email: `admin@${data.name.toLowerCase().replace(/\s+/g, '')}.com`, // ⚠️ à améliorer
                password: await bcrypt.hash('Password123', 10), // ⚠️ à remplacer en prod
                role: UserRole.ENTERPRISE,
                status: UserStatus.ACTIVE,
                company: savedCompany,
            });

            await queryRunner.manager.save(enterpriseUser);

            // -------------------------
            // COMMIT
            // -------------------------
            await queryRunner.commitTransaction();

            return savedCompany;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateCompanyDto, logo?: UploadedFile): Promise<Company> {
        const company = await this.findOne(id)

        // Si un nouveau logo est fourni, on supprime l'ancien et on remplace
        if (logo) {
            if (company.logo) this.deleteLogoFile(company.logo)
            company.logo = await this.handleLogoUpload(logo)
        }

        Object.assign(company, data)
        return await this.companyRepository.save(company)
    }

    /*
    |--------------------------------------------------------------------------
    | HANDLE LOGO UPLOAD
    |--------------------------------------------------------------------------
    */
    private async handleLogoUpload(file: UploadedFile): Promise<string> {
        if (!this.allowedImageTypes.includes(file.mimetype)) {
            throw new BadRequestException('Unsupported image type')
        }

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true })
        }

        const ext = path.extname(file.originalname)
        const fileName = `${uuidv4()}${ext}`
        const filePath = path.join(this.uploadDir, fileName)

        fs.writeFileSync(filePath, file.buffer)
        return `/storage/companies/${fileName}` // chemin stocké dans la DB
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE LOGO FILE
    |--------------------------------------------------------------------------
    */
    private deleteLogoFile(filePath: string) {
        const fullPath = path.join(__dirname, '../../', filePath)
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath)
        }
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL, FIND ONE, REMOVE, PAGINATE
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<Company[]> {
        return await this.companyRepository.find({ relations: ['jobOffers'] })
    }

    async findOne(id: string): Promise<Company> {
        const company = await this.companyRepository.findOne({
            where: { id },
            relations: ['jobOffers']
        })
        if (!company) throw new NotFoundException('Company not found')
        return company
    }

    async remove(id: string): Promise<{ message: string }> {
        const company = await this.findOne(id)
        if (company.logo) this.deleteLogoFile(company.logo)
        await this.companyRepository.remove(company)
        return { message: 'Company deleted successfully' }
    }

    async paginate(
        page: number = 1,
        limit: number = 10,
        filters?: {
            name?: string
            sector?: string
            status?: CompanyStatus
            partnershipDate?: string
        }
    ) {
        const query = this.companyRepository.createQueryBuilder('company')
            .leftJoinAndSelect('company.jobOffers', 'jobOffers')

        if (filters) {
            if (filters.name) query.andWhere('company.name ILIKE :name', { name: `%${filters.name}%` })
            if (filters.sector) query.andWhere('company.sector ILIKE :sector', { sector: `%${filters.sector}%` })
            if (filters.status) query.andWhere('company.status = :status', { status: filters.status })
            if (filters.partnershipDate) query.andWhere('DATE(company.partnershipDate) = :date', { date: filters.partnershipDate })
        }

        query.orderBy('company.partnershipDate', 'DESC')
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