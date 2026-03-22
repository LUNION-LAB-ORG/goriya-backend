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
import { CompaniesService } from './companies.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyStatus } from 'src/@types/enums'
import { Public } from 'src/auth/public.decorator'

@Public()
@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    @UseInterceptors(FileInterceptor('logo'))
    async create(@Body() data: CreateCompanyDto, @UploadedFile() logo?: Express.Multer.File) {
        return this.companiesService.create(data, logo)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    async findAll() {
        return this.companiesService.findAll()
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
        @Query('name') name?: string,
        @Query('sector') sector?: string,
        @Query('status') status?: CompanyStatus,
        @Query('partnershipDate') partnershipDate?: string,
    ) {
        const filters: any = {}
        if (name) filters.name = name
        if (sector) filters.sector = sector
        if (status) filters.status = status
        if (partnershipDate) filters.partnershipDate = partnershipDate

        return this.companiesService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.companiesService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    @UseInterceptors(FileInterceptor('logo'))
    async update(
        @Param('id') id: string, 
        @Body() data: UpdateCompanyDto, 
        @UploadedFile() logo?: Express.Multer.File
    ) {
        return this.companiesService.update(id, data, logo)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.companiesService.remove(id)
    }
}