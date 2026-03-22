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
import { JobOffersService } from './job-offers.service'
import { UpdateJobOfferDto } from './dto/update-job-offer.dto'
import { CreatePortfolioDto } from '../portfolios/dto/create-portfolio.dto'
import { JobStatus, JobType } from '../@types/enums'
import { Public } from '../auth/public.decorator'

@Public()
@Controller('job-offers')
export class JobOffersController {
    constructor(private readonly jobOffersService: JobOffersService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    async create(@Body() data: CreatePortfolioDto) {
        return this.jobOffersService.create(data)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.jobOffersService.findAll()
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
        @Query('title') title?: string,
        @Query('location') location?: string,
        @Query('type') type?: JobType,
        @Query('salary') salary?: string,
        @Query('status') status?: JobStatus,
        @Query('companyId') companyId?: string,
        @Query('applicants') applicants?: number,
    ) {
        const filters: any = {}
        if (title) filters.title = title
        if (location) filters.location = location
        if (type) filters.type = type
        if (salary) filters.salary = salary
        if (status) filters.status = status
        if (companyId) filters.companyId = companyId
        if (applicants !== undefined) filters.applicants = applicants

        return this.jobOffersService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.jobOffersService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: UpdateJobOfferDto) {
        return this.jobOffersService.update(id, data)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.jobOffersService.remove(id)
    }
}