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
    UseGuards
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { CompanyStatus, UserRole, UserStatus } from 'src/@types/enums'
import { Roles } from 'src/auth/roles.decorator'
import { Public } from 'src/auth/public.decorator'

@Public()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /*
    |----------------------------------------------------------------------
    | CREATE
    |----------------------------------------------------------------------
    */
    @Post()
    // @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    async create(@Body() data: CreateUserDto, @UploadedFile() avatar?: Express.Multer.File) {
        return this.usersService.create(data, avatar)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ALL
    |----------------------------------------------------------------------
    */
    @Get()
    // @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.usersService.findAll()
    }

    /*
    |----------------------------------------------------------------------
    | PAGINATED SEARCH AVEC FILTRES
    |----------------------------------------------------------------------
    */
    @Get('paginate')
    // @Roles(UserRole.ADMIN)
    // @UseGuards(JwtAuthGuard)
    async paginate(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    
        @Query('name') name?: string,
        @Query('email') email?: string,
        @Query('role') role?: UserRole,
        @Query('status') status?: UserStatus,
        @Query('registrationDate') registrationDate?: string,
    
        // 🔥 nouveaux filtres company
        @Query('companyName') companyName?: string,
        @Query('companyId') companyId?: string,
        @Query('companyStatus') companyStatus?: CompanyStatus,
    ) {
        const filters: any = {}
    
        // USER FILTERS
        if (name) filters.name = name
        if (email) filters.email = email
        if (role) filters.role = role
        if (status) filters.status = status
        if (registrationDate) filters.registrationDate = registrationDate
    
        // 🔥 COMPANY FILTERS
        if (companyName) filters.companyName = companyName
        if (companyId) filters.companyId = companyId
        if (companyStatus) filters.companyStatus = companyStatus
    
        return this.usersService.paginate(page, limit, filters)
    }

    /*
    |----------------------------------------------------------------------
    | FIND ONE
    |----------------------------------------------------------------------
    */
    @Get(':id')
    // @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id)
    }

    /*
    |----------------------------------------------------------------------
    | UPDATE
    |----------------------------------------------------------------------
    */
    @Patch(':id')
    // @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    async update(
        @Param('id') id: string,
        @Body() data: UpdateUserDto,
        @UploadedFile() avatar?: Express.Multer.File
    ) {
        return this.usersService.update(id, data, avatar)
    }

    /*
    |----------------------------------------------------------------------
    | DELETE
    |----------------------------------------------------------------------
    */
    @Delete(':id')
    // @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id)
    }
}