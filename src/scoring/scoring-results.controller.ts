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
import { ScoringResultsService } from './scoring-results.service'
import { CreateScoringResultDto } from './dto/create-scoring-result.dto'
import { UpdateScoringResultDto } from './dto/update-scoring-result.dto'
import { Public } from '../auth/public.decorator'

@Public()
@Controller('scoring-results')
export class ScoringResultsController {
    constructor(private readonly scoringResultsService: ScoringResultsService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    async create(@Body() data: CreateScoringResultDto) {
        return this.scoringResultsService.create(data)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.scoringResultsService.findAll()
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
        @Query('position') position?: string,
        @Query('overallScore') overallScore?: number,
        @Query('analysisDate') analysisDate?: string, // yyyy-mm-dd
        @Query('status') status?: string,
    ) {
        const filters: any = {}
        if (candidateName) filters.candidateName = candidateName
        if (candidateEmail) filters.candidateEmail = candidateEmail
        if (position) filters.position = position
        if (overallScore !== undefined) filters.overallScore = Number(overallScore)
        if (analysisDate) filters.analysisDate = analysisDate
        if (status) filters.status = status

        return this.scoringResultsService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.scoringResultsService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: UpdateScoringResultDto) {
        return this.scoringResultsService.update(id, data)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.scoringResultsService.remove(id)
    }
}