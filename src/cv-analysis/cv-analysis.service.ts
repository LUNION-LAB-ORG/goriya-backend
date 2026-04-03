import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CVAnalysis } from './cv-analysis.entity'
import { CVStatus } from '../@types/enums'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { UploadedFile } from '../@types/utils'
import { CreateCvAnalysisDto } from './dto/create-cv-analysis.dto'
import { UpdateCvAnalysisDto } from './dto/update-cv-analysis.dto'
import { CVAnalysisVm } from './dto/cv-analysis.vm'

@Injectable()
export class CVAnalysisService {
    constructor(
        @InjectRepository(CVAnalysis)
        private readonly cvAnalysisRepository: Repository<CVAnalysis>,
    ) {}

    private readonly allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    private readonly uploadDir = path.join(__dirname, '../../storage/cv-analysis')

    /*
    |--------------------------------------------------------------------------
    | HANDLE FILE UPLOAD
    |--------------------------------------------------------------------------
    */
    private async handleFileUpload(file: UploadedFile): Promise<string> {
        if (!this.allowedFileTypes.includes(file.mimetype)) {
            throw new BadRequestException('Unsupported file type. Only PDF and Word allowed.')
        }

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true })
        }

        const ext = path.extname(file.originalname)
        const fileName = `${uuidv4()}${ext}`
        const filePath = path.join(this.uploadDir, fileName)

        fs.writeFileSync(filePath, file.buffer)
        return `/storage/cv-analysis/${fileName}`
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE FILE
    |--------------------------------------------------------------------------
    */
    private deleteFile(filePath: string) {
        const fullPath = path.join(__dirname, '../../', filePath)
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    }

    private toVm(entity: CVAnalysis): CVAnalysisVm {
        return new CVAnalysisVm({
            id: entity.id,
            fileName: entity.fileName,
            analysisScore: entity.analysisScore,
            recommendations: entity.recommendations,
            uploadDate: entity.uploadDate,
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
    async create(data: CreateCvAnalysisDto, file: UploadedFile): Promise<CVAnalysisVm> {
        try {
            const fileName = await this.handleFileUpload(file)

            const cv = this.cvAnalysisRepository.create({
                ...data,
                fileName: fileName
            })
            return this.toVm(await this.cvAnalysisRepository.save(cv))

        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException((error as any).message || 'Erreur interne lors de la création');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    async update(id: string, data: UpdateCvAnalysisDto, file?: UploadedFile): Promise<CVAnalysisVm> {
        try {
            const cv = await this.cvAnalysisRepository.findOne({ where: { id } })
            if (!cv) throw new NotFoundException('CVAnalysis not found')

            // Gestion du nouveau fichier uploadé
            if (file) {
                // Supprimer l'ancien fichier si nécessaire
                if (cv.fileName) {
                    await this.deleteFile(cv.fileName);
                }

                // Enregistrer le nouveau fichier et récupérer son nom
                const newFileName = await this.handleFileUpload(file);
                cv.fileName = newFileName;
            }

            Object.assign(cv, data)
            return this.toVm(await this.cvAnalysisRepository.save(cv))

        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException((error as any).message || 'Erreur interne lors de la mise à jour');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ALL
    |--------------------------------------------------------------------------
    */
    async findAll(): Promise<CVAnalysisVm[]> {
        const cvs = await this.cvAnalysisRepository.find()
        return cvs.map(c => this.toVm(c))
    }

    /*
    |--------------------------------------------------------------------------
    | FIND ONE
    |--------------------------------------------------------------------------
    */
    async findOne(id: string): Promise<CVAnalysisVm> {
        const cv = await this.cvAnalysisRepository.findOne({ where: { id } })
        if (!cv) throw new NotFoundException('CVAnalysis not found')
        return this.toVm(cv)
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    async remove(id: string): Promise<{ message: string }> {
        try {
            const cv = await this.cvAnalysisRepository.findOne({ where: { id } })
            if (!cv) throw new NotFoundException('CVAnalysis not found')
            if (cv.fileName) this.deleteFile(cv.fileName)
            await this.cvAnalysisRepository.remove(cv)
            return { message: 'CVAnalysis deleted successfully' }
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException((error as any).message || 'Erreur interne lors de la suppression');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PAGINATED SEARCH
    |--------------------------------------------------------------------------
    */
    async paginate(
        page: number = 1,
        limit: number = 10,
        filters?: {
            analysisScore?: number
            recommendations?: string[] // recherche si au moins une recommandation correspond
            uploadDate?: string // yyyy-mm-dd
            status?: CVStatus
        }
    ) {
        const query = this.cvAnalysisRepository.createQueryBuilder('cv')

        if (filters) {
            if (filters.analysisScore !== undefined) query.andWhere('cv.analysisScore = :analysisScore', { analysisScore: filters.analysisScore })
            if (filters.recommendations && filters.recommendations.length > 0) query.andWhere('cv.recommendations && :recs', { recs: filters.recommendations })
            if (filters.uploadDate) query.andWhere('DATE(cv.uploadDate) = :date', { date: filters.uploadDate })
            if (filters.status) query.andWhere('cv.status = :status', { status: filters.status })
        }

        query.orderBy('cv.uploadDate', 'DESC')
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