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
    ParseIntPipe,
    UploadedFiles
} from '@nestjs/common'
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { CompaniesService } from './companies.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyStatus } from '../@types/enums'
import { Public } from '../auth/public.decorator'

@Public()
@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logo', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 }
        ])
    )
    async create(
        @Body() data: CreateCompanyDto,
        @UploadedFiles() files: {
            logo?: Express.Multer.File[],
            coverImage?: Express.Multer.File[]
        }
    ) {
        return this.companiesService.create(data, files);
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

        @Query('country') country?: string,
        @Query('city') location?: string,
        @Query('companySize') companySize?: string,

        @Query('email') email?: string,
        @Query('phone') phone?: string,

        @Query('website') website?: string,

        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters: any = {
            name,
            sector,
            status,
            country,
            location,
            companySize,
            email,
            phone,
            website,
            startDate,
            endDate
        };

        return this.companiesService.paginate(page, limit, filters);
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
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logo', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 }
        ])
    )
    async update(
        @Param('id') id: string,
        @Body() data: UpdateCompanyDto,
        @UploadedFiles() files: {
            logo?: Express.Multer.File[],
            coverImage?: Express.Multer.File[]
        }
    ) {
        return this.companiesService.update(id, data, files);
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