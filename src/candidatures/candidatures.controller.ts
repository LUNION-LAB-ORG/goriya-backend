import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Delete, 
    Param, 
    Body, 
    Query, 
    ParseIntPipe 
} from '@nestjs/common'
import { CandidaturesService } from './candidatures.service'
import { CreateCandidatureDto } from './dto/create-candidature.dto'
import { UpdateCandidatureDto } from './dto/update-candidature.dto'
import { CandidatureStatus } from '../@types/enums'
import { Public } from '../auth/public.decorator'

@Public()
@Controller('candidatures')
export class CandidaturesController {
    constructor(private readonly candidaturesService: CandidaturesService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    async create(@Body() data: CreateCandidatureDto) {
        return this.candidaturesService.create(data)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.candidaturesService.findAll()
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
        @Query('candidateName') candidateName?: string,
        @Query('candidateEmail') candidateEmail?: string,
        @Query('status') status?: CandidatureStatus,
        @Query('score') score?: number,
        @Query('appliedDate') appliedDate?: string,
        @Query('userId') userId?: string,
        @Query('jobOfferId') jobOfferId?: string,
    ) {
        const filters: any = {}

        if (candidateName) filters.candidateName = candidateName
        if (candidateEmail) filters.candidateEmail = candidateEmail
        if (status) filters.status = status
        if (score !== undefined) filters.score = score
        if (appliedDate) filters.appliedDate = appliedDate
        if (userId) filters.userId = userId
        if (jobOfferId) filters.jobOfferId = jobOfferId

        return this.candidaturesService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.candidaturesService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: UpdateCandidatureDto) {
        return this.candidaturesService.update(id, data)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.candidaturesService.remove(id)
    }
}