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
import { PortfoliosService } from './portfolios.service'
import { CreatePortfolioDto } from './dto/create-portfolio.dto'
import { UpdatePortfolioDto } from './dto/update-portfolio.dto'
import { Public } from '../auth/public.decorator'

@Public()
@Controller('portfolios')
export class PortfoliosController {
    constructor(private readonly portfoliosService: PortfoliosService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    async create(@Body() data: CreatePortfolioDto) {
        return this.portfoliosService.create(data)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.portfoliosService.findAll()
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
        @Query('description') description?: string,
        @Query('skills') skills?: string[],
        @Query('views') views?: number,
        @Query('downloads') downloads?: number,
        @Query('likes') likes?: number,
        @Query('createdDate') createdDate?: string, // yyyy-mm-dd
        @Query('userId') userId?: string,
    ) {
        const filters: any = {}
        if (title) filters.title = title
        if (description) filters.description = description
        if (skills) filters.skills = Array.isArray(skills) ? skills : [skills]
        if (views !== undefined) filters.views = views
        if (downloads !== undefined) filters.downloads = downloads
        if (likes !== undefined) filters.likes = likes
        if (createdDate) filters.createdDate = createdDate
        if (userId) filters.userId = userId

        return this.portfoliosService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.portfoliosService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: UpdatePortfolioDto) {
        return this.portfoliosService.update(id, data)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.portfoliosService.remove(id)
    }
}