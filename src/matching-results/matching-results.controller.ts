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
import { MatchingResultsService } from './matching-results.service'
import { CreateMatchingResultDto } from './dto/create-matching-result.dto'
import { UpdateMatchingResultDto } from './dto/update-matching-result.dto'
import { MatchingStatus } from 'src/@types/enums'
import { Public } from 'src/auth/public.decorator'

@Public()
@Controller('matching-results')
export class MatchingResultsController {
    constructor(private readonly matchingResultsService: MatchingResultsService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    async create(@Body() data: CreateMatchingResultDto) {
        return this.matchingResultsService.create(data)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.matchingResultsService.findAll()
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
        @Query('company') company?: string,
        @Query('matchingScore') matchingScore?: number,
        @Query('status') status?: MatchingStatus,
        @Query('matchDate') matchDate?: string, // yyyy-mm-dd
    ) {
        const filters: any = {}
        if (candidateName) filters.candidateName = candidateName
        if (candidateEmail) filters.candidateEmail = candidateEmail
        if (position) filters.position = position
        if (company) filters.company = company
        if (matchingScore !== undefined) filters.matchingScore = matchingScore
        if (status) filters.status = status
        if (matchDate) filters.matchDate = matchDate

        return this.matchingResultsService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.matchingResultsService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: UpdateMatchingResultDto) {
        return this.matchingResultsService.update(id, data)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.matchingResultsService.remove(id)
    }
}