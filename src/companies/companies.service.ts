import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { Repository } from 'typeorm'
import { Company } from './company.entity'
import { User } from '../users/user.entity'
import { UploadedFile } from '../@types/utils'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyStatus, UserRole, UserStatus } from '../@types/enums'
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CompanyVm } from './dto/company.vm'

@Injectable()
export class CompaniesService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService, // 🔥 AJOUT
    ) { }

    private readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    private readonly uploadDir = path.join('/tmp/uploads/companies')

    private toVm(entity: Company): CompanyVm {
        return new CompanyVm({
            id: entity.id,
            name: entity.name,
            sector: entity.sector,
            logo: entity.logo ?? null,
            coverImage: entity.coverImage ?? null,
            about: entity.about ?? null,
            website: entity.website ?? null,
            creationDate: entity.creationDate ?? null,
            partnershipDate: entity.partnershipDate,
            companySize: entity.companySize ?? null,
            socialLinks: entity.socialLinks ?? [],
            country: entity.country ?? null,
            headquarters: entity.headquarters ?? null,
            location: entity.location ?? null,
            phone: entity.phone ?? null,
            email: entity.email ?? null,
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
    async create(data: CreateCompanyDto, files?: { logo?: UploadedFile[], coverImage?: UploadedFile[] }) {
        const queryRunner = this.companyRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            // 1. Handle files safely
            let logoPath: string | undefined;
            let coverPath: string | undefined;
    
            try {
                if (files?.logo?.[0]) logoPath = await this.handleLogoUpload(files.logo[0]);
                if (files?.coverImage?.[0]) coverPath = await this.handleLogoUpload(files.coverImage[0]);
            } catch (fileErr) {
                console.error('Erreur upload fichiers:', fileErr);
                throw new BadRequestException('Erreur lors du traitement des fichiers');
            }
    
            // 2. Parse socialLinks safely
            let socialLinks: string[] = [];
            if (data.socialLinks) {
                try {
                    socialLinks = typeof data.socialLinks === 'string'
                        ? JSON.parse(data.socialLinks)
                        : data.socialLinks;
                } catch {
                    throw new BadRequestException('socialLinks mal formé');
                }
            }
    
            // 3. Validate required fields
            if (!data.companyName) throw new BadRequestException('companyName requis');
            if (!data.email || !data.password) throw new BadRequestException('email et password requis');
    
            // 4. Create company
            const company = queryRunner.manager.create(Company, {
                name: data.companyName,
                sector: data.sector,
                about: data.about,
                creationDate: data.creationDate,
                companySize: data.companySize,
                website: data.website,
                socialLinks,
                country: data.country,
                headquarters: data.headquarters,
                location: data.location,
                phone: data.phone,
                email: data.email,
                status: data.status ?? CompanyStatus.ACTIVE,
                partnershipDate: data.partnershipDate,
                logo: logoPath,
                coverImage: coverPath,
            });
    
            const savedCompany = await queryRunner.manager.save(company);
    
            // 5. Create enterprise user
            const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    
            const enterpriseUser = queryRunner.manager.create(User, {
                name: data.companyName,
                email: data.email,
                password: hashedPassword,
                role: UserRole.ENTERPRISE,
                status: UserStatus.ACTIVE,
                company: savedCompany,
                registrationDate: new Date(),
            });
    
            const savedUser = await queryRunner.manager.save(enterpriseUser);
    
            // 6. Generate token
            const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
            const accessToken = this.jwtService.sign(payload);
    
            await queryRunner.commitTransaction();

            const { password: _, ...safeUser } = savedUser;
    
            return { company: this.toVm(savedCompany), user: safeUser, accessToken };
    
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('CREATE COMPANY ERROR:', error);
            const err = error as any;

            if (err.code === '23505') { // PostgreSQL unique violation
                if (err.detail.includes('email')) {
                    throw new BadRequestException('Cette adresse email est déjà utilisée');
                }
                if (err.detail.includes('name')) { // 🔹 change companyName → name
                    throw new BadRequestException('Le nom de l’entreprise est déjà utilisé');
                }
                if (err.detail.includes('phone')) {
                    throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
                }
                throw new BadRequestException('Valeur unique déjà utilisée');
            }
            
            if (error instanceof BadRequestException) throw error;

            throw new InternalServerErrorException(err.message || 'Erreur interne lors de la création');
        } finally {
            await queryRunner.release();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateCompanyDto, files?: {
        logo?: UploadedFile[],
        coverImage?: UploadedFile[]
    }): Promise<CompanyVm> {
        try {
            const company = await this.companyRepository.findOne({ where: { id } });
            if (!company) throw new NotFoundException('Company not found');

            if (files?.logo?.[0]) {
                if (company.logo) this.deleteLogoFile(company.logo);
                company.logo = await this.handleLogoUpload(files.logo[0]);
            }

            if (files?.coverImage?.[0]) {
                if (company.coverImage) this.deleteLogoFile(company.coverImage);
                company.coverImage = await this.handleLogoUpload(files.coverImage[0]);
            }

            if (data.socialLinks) {
                data.socialLinks = typeof data.socialLinks === 'string'
                    ? JSON.parse(data.socialLinks)
                    : data.socialLinks;
            }

            Object.assign(company, {
                ...data,
                name: data.companyName ?? company.name
            });

            return this.toVm(await this.companyRepository.save(company));

        } catch (error) {
            const err = error as any;

            if (err.code === '23505') {
                if (err.detail?.includes('email')) throw new BadRequestException('Cette adresse email est déjà utilisée');
                if (err.detail?.includes('name')) throw new BadRequestException("Le nom de l'entreprise est déjà utilisé");
                if (err.detail?.includes('phone')) throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
                throw new BadRequestException('Valeur unique déjà utilisée');
            }

            if (error instanceof BadRequestException) throw error;
            if (error instanceof NotFoundException) throw error;

            throw new InternalServerErrorException(err.message || 'Erreur interne lors de la mise à jour');
        }
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
        return `/companies/${fileName}` // chemin stocké dans la DB
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
    async findAll(): Promise<CompanyVm[]> {
        const companies = await this.companyRepository.find({ relations: ['jobOffers', 'users'] })
        return companies.map(c => this.toVm(c))
    }

    async findOne(id: string): Promise<CompanyVm> {
        const company = await this.companyRepository.findOne({
            where: { id },
            relations: ['jobOffers', 'users']
        })
        if (!company) throw new NotFoundException('Company not found')
        return this.toVm(company)
    }

    async remove(id: string): Promise<{ message: string }> {
        try {
            const company = await this.companyRepository.findOne({ where: { id } })
            if (!company) throw new NotFoundException('Company not found')
            if (company.logo) this.deleteLogoFile(company.logo)
            if (company.coverImage) this.deleteLogoFile(company.coverImage)
            await this.companyRepository.remove(company)
            return { message: 'Company deleted successfully' }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException((error as any).message || 'Erreur interne lors de la suppression');
        }
    }

    async paginate(
        page: number = 1,
        limit: number = 10,
        filters?: any
    ) {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .leftJoinAndSelect('company.jobOffers', 'jobOffers');
    
        // 🔍 TEXT SEARCH (ILIKE)
        if (filters?.name) {
            query.andWhere('company.name ILIKE :name', {
                name: `%${filters.name}%`
            });
        }
    
        if (filters?.sector) {
            query.andWhere('company.sector ILIKE :sector', {
                sector: `%${filters.sector}%`
            });
        }
    
        if (filters?.country) {
            query.andWhere('company.country ILIKE :country', {
                country: `%${filters.country}%`
            });
        }
    
        if (filters?.location) {
            query.andWhere('company.location ILIKE :location', {
                location: `%${filters.location}%`
            });
        }
    
        if (filters?.companySize) {
            query.andWhere('company.companySize = :companySize', {
                companySize: filters.companySize
            });
        }
    
        if (filters?.email) {
            query.andWhere('company.email ILIKE :email', {
                email: `%${filters.email}%`
            });
        }
    
        if (filters?.phone) {
            query.andWhere('company.phone ILIKE :phone', {
                phone: `%${filters.phone}%`
            });
        }
    
        if (filters?.website) {
            query.andWhere('company.website ILIKE :website', {
                website: `%${filters.website}%`
            });
        }
    
        // 🎯 ENUM
        if (filters?.status) {
            query.andWhere('company.status = :status', {
                status: filters.status
            });
        }
    
        // 📅 DATE RANGE (important)
        if (filters?.startDate && filters?.endDate) {
            query.andWhere(
                'company.partnershipDate BETWEEN :startDate AND :endDate',
                {
                    startDate: filters.startDate,
                    endDate: filters.endDate
                }
            );
        } else if (filters?.startDate) {
            query.andWhere('company.partnershipDate >= :startDate', {
                startDate: filters.startDate
            });
        } else if (filters?.endDate) {
            query.andWhere('company.partnershipDate <= :endDate', {
                endDate: filters.endDate
            });
        }
    
        // 📊 ORDER + PAGINATION
        query
            .orderBy('company.createdAt', 'DESC') // 🔥 mieux que partnershipDate
            .skip((page - 1) * limit)
            .take(limit);
    
        const [data, total] = await query.getManyAndCount();
    
        return {
            data: data.map(c => this.toVm(c)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}