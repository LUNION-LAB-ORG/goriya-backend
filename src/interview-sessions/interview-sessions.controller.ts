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
import { InterviewSessionsService } from './interview-sessions.service'
import { CreateInterviewSessionDto } from './dto/create-interview-session.dto'
import { UpdateInterviewSessionDto } from './dto/update-interview-session.dto'
import { InterviewStatus } from 'src/@types/enums'
import { Public } from 'src/auth/public.decorator'

@Public()
@Controller('interview-sessions')
export class InterviewSessionsController {
    constructor(private readonly interviewSessionsService: InterviewSessionsService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    async create(@Body() data: CreateInterviewSessionDto) {
        return this.interviewSessionsService.create(data)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.interviewSessionsService.findAll()
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
        @Query('duration') duration?: number,
        @Query('score') score?: number,
        @Query('status') status?: InterviewStatus,
        @Query('startTime') startTime?: string, // yyyy-mm-dd
    ) {
        const filters: any = {}
        if (candidateName) filters.candidateName = candidateName
        if (candidateEmail) filters.candidateEmail = candidateEmail
        if (position) filters.position = position
        if (duration !== undefined) filters.duration = duration
        if (score !== undefined) filters.score = score
        if (status) filters.status = status
        if (startTime) filters.startTime = startTime

        return this.interviewSessionsService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.interviewSessionsService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: UpdateInterviewSessionDto) {
        return this.interviewSessionsService.update(id, data)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.interviewSessionsService.remove(id)
    }
}