import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { Company } from '../companies/company.entity'
import { UserRole, UserStatus } from '../@types/enums'
import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserVm } from './dto/user.vm'
import { CompanyVm } from '../companies/dto/company.vm'
import { UploadedFile } from '../@types/utils'

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,

        private readonly jwtService: JwtService,
    ) {}

    private toVm(user: User): UserVm {
        return new UserVm({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            avatar: user.avatar ?? null,
            registrationDate: user.registrationDate,
            company: user.company ? new CompanyVm({ id: user.company.id, name: user.company.name }) : null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        })
    }

    private readonly allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    private readonly uploadDir = path.join('/tmp/uploads/avatars')

    /*
    |--------------------------------------------------------------------------
    | HANDLE FILE UPLOAD
    |--------------------------------------------------------------------------
    */
    private async handleAvatarUpload(file: UploadedFile): Promise<string> {
        if (!this.allowedFileTypes.includes(file.mimetype)) {
            throw new BadRequestException('Unsupported file type')
        }

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true })
        }

        const ext = path.extname(file.originalname)
        const fileName = `${uuidv4()}${ext}`
        const filePath = path.join(this.uploadDir, fileName)

        fs.writeFileSync(filePath, file.buffer)
        return `/avatars/${fileName}`
    }

    private deleteFile(filePath: string) {
        const fullPath = path.join(__dirname, '../../', filePath)
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */
    async create(data: CreateUserDto, avatar?: UploadedFile): Promise<{ user: UserVm; accessToken: string }> {

        const userData: Partial<User> = { ...data }

        // hash password
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10
        userData.password = await bcrypt.hash(data.password, saltRounds)

        // avatar upload
        if (avatar) {
            userData.avatar = await this.handleAvatarUpload(avatar)
        }

        // gestion entreprise
        let company: Company | null = null;

        if (data.companyId) {

            if (data.role !== UserRole.ENTERPRISE) {
                throw new BadRequestException('Only enterprise users can have a company')
            }

            company = await this.companyRepository.findOne({
                where: { id: data.companyId }
            })

            if (!company) {
                throw new NotFoundException('Company not found')
            }

            userData.company = company
        }

        const user = this.userRepository.create(userData)

        const savedUser = await this.userRepository.save(user)

        const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role }
        const accessToken = this.jwtService.sign(payload)

        return { user: this.toVm(savedUser), accessToken }
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<UserVm[]> {
        const users = await this.userRepository.find({
            relations: ['portfolios', 'candidatures', 'company']
        })
        return users.map(u => this.toVm(u))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<UserVm> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['portfolios', 'candidatures', 'company']
        })

        if (!user) throw new NotFoundException('User not found')

        return this.toVm(user)
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE BY EMAIL WITH PASSWORD
    |--------------------------------------------------------------------------
    */
    async findByEmailWithPassword(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'role', 'status', 'name'], // ⚠️ important
        });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(
        id: string,
        data: UpdateUserDto,
        avatar?: UploadedFile
    ): Promise<UserVm> {

        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['portfolios', 'candidatures', 'company']
        })

        if (!user) throw new NotFoundException('User not found')

        // hash password si présent
        if (data.password) {
            const saltRounds = Number(process.env.SALT_ROUNDS) || 10
            data.password = await bcrypt.hash(data.password, saltRounds)
        }

        // avatar
        if (avatar) {
            if (user.avatar) this.deleteFile(user.avatar)
            user.avatar = await this.handleAvatarUpload(avatar)
        }

        // gestion company update
        if (data.companyId) {

            if (data.role && data.role !== UserRole.ENTERPRISE) {
                throw new BadRequestException('Only enterprise users can have a company')
            }

            const company = await this.companyRepository.findOne({
                where: { id: data.companyId }
            })

            if (!company) {
                throw new NotFoundException('Company not found')
            }

            user.company = company
        }

        Object.assign(user, data)

        return this.toVm(await this.userRepository.save(user))
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } })

        if (!user) throw new NotFoundException('User not found')

        if (user.avatar) this.deleteFile(user.avatar)

        await this.userRepository.remove(user)

        return { message: 'User deleted successfully' }
    }

    /*
    |--------------------------------------------------------------------------
    | PAGINATION + FILTERS
    |--------------------------------------------------------------------------
    */
    async paginate(
        page: number = 1,
        limit: number = 10,
        filters?: {
            name?: string
            email?: string
            role?: UserRole
            status?: UserStatus
            registrationDate?: string
    
            companyName?: string
            companyId?: string
            companyStatus?: string
        }
    ) {
        const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.company', 'company')
    
        if (filters) {
    
            // 🔹 USER FILTERS
            if (filters.name)
                query.andWhere('user.name ILIKE :name', { name: `%${filters.name}%` })
    
            if (filters.email)
                query.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` })
    
            if (filters.role)
                query.andWhere('user.role = :role', { role: filters.role })
    
            if (filters.status)
                query.andWhere('user.status = :status', { status: filters.status })
    
            if (filters.registrationDate)
                query.andWhere('DATE(user.registrationDate) = :date', {
                    date: filters.registrationDate
                })
    
            // 🔥 COMPANY FILTERS
            if (filters.companyName)
                query.andWhere('company.name ILIKE :companyName', {
                    companyName: `%${filters.companyName}%`
                })
    
            if (filters.companyId)
                query.andWhere('company.id = :companyId', {
                    companyId: filters.companyId
                })
    
            if (filters.companyStatus)
                query.andWhere('company.status = :companyStatus', {
                    companyStatus: filters.companyStatus
                })
        }
    
        query
            .orderBy('user.registrationDate', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
    
        const [data, total] = await query.getManyAndCount()
    
        return {
            data: data.map(u => this.toVm(u)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}