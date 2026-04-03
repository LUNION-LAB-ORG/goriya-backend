import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Delete, 
    Param, 
    Body, 
    Query, 
    UploadedFile, 
    UseInterceptors, 
    ParseIntPipe 
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CVAnalysisService } from './cv-analysis.service'
import { CreateCvAnalysisDto } from './dto/create-cv-analysis.dto'
import { UpdateCvAnalysisDto } from './dto/update-cv-analysis.dto'
import { CVStatus } from '../@types/enums'
import { Public } from '../auth/public.decorator'
import type { UploadedFile as MulterFile } from '../@types/utils'

@Public()
@Controller('cv-analysis')
export class CVAnalysisController {
    constructor(private readonly cvAnalysisService: CVAnalysisService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(@Body() data: CreateCvAnalysisDto, @UploadedFile() file: MulterFile) {
        return this.cvAnalysisService.create(data, file)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.cvAnalysisService.findAll()
    }

    /*
    |----------------------------------------------------------------------
    | PAGINATED SEARCH AVEC FILTRES
    |----------------------------------------------------------------------
    */
    @Get('paginate')
    async paginate(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
        @Query('analysisScore') analysisScore?: number,
        @Query('recommendations') recommendations?: string, // CSV : "rec1,rec2"
        @Query('uploadDate') uploadDate?: string,
        @Query('status') status?: CVStatus,
    ) {
        const filters: any = {}

        if (analysisScore !== undefined) filters.analysisScore = analysisScore
        if (recommendations) filters.recommendations = recommendations.split(',')
        if (uploadDate) filters.uploadDate = uploadDate
        if (status) filters.status = status

        return this.cvAnalysisService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.cvAnalysisService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Param('id') id: string, 
        @Body() data: UpdateCvAnalysisDto, 
        @UploadedFile() file?: MulterFile
    ) {
        return this.cvAnalysisService.update(id, data, file)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.cvAnalysisService.remove(id)
    }
}