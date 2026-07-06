import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CompanyStatus, UserRole } from '../@types/enums';
import { CompaniesService } from '../companies/companies.service';
import { Roles } from '../auth/roles.decorator';
import { AdminPlatformService } from './admin-platform.service';
import { paginated, success } from './admin-response';
import type { UploadedFile as MulterFile } from '../@types/utils';

function asArray(value?: string | string[]) {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

@Roles(UserRole.ADMIN)
@ApiTags('Admin Companies')
@Controller('admin/companies')
export class AdminCompaniesController {
    constructor(
        private readonly companiesService: CompaniesService,
        private readonly adminPlatformService: AdminPlatformService,
    ) {}

    @Get('paginate')
    async paginateCompanies(
        @Query('search') search?: string,
        @Query('industry') industry?: string | string[],
        @Query('size') size?: string | string[],
        @Query('location') location?: string | string[],
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return paginated(await this.companiesService.paginate(Number(page), Number(limit), {
            name: search,
            sector: asArray(industry)[0],
            companySize: asArray(size)[0],
            location: asArray(location)[0],
        }));
    }

    @Get('stats')
    async getStats() {
        return success(await this.adminPlatformService.getCompanyStats());
    }

    @Get('sectors')
    async getSectors() {
        return success(await this.adminPlatformService.getCompanySectors());
    }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]))
    async createCompany(
        @Body() body: Record<string, unknown>,
        @UploadedFiles() files: { logo?: MulterFile[]; coverImage?: MulterFile[] },
    ) {
        const result = await this.companiesService.create(body as never, files);
        return success(result.company);
    }

    @Post(':companyId/follow')
    async followCompany(@Param('companyId') companyId: string) {
        await this.adminPlatformService.followCompany(companyId);
        return success(null);
    }

    @Delete(':companyId/follow')
    async unfollowCompany(@Param('companyId') companyId: string) {
        await this.adminPlatformService.unfollowCompany(companyId);
        return success(null);
    }

    @Get(':companyId/jobs')
    async getCompanyJobs(@Param('companyId') companyId: string) {
        return success(await this.adminPlatformService.getCompanyJobs(companyId));
    }

    @Get(':id')
    async getCompany(@Param('id') id: string) {
        return success(await this.companiesService.findOne(id));
    }

    @Patch(':id')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]))
    async updateCompany(
        @Param('id') id: string,
        @Body() body: Record<string, unknown>,
        @UploadedFiles() files: { logo?: MulterFile[]; coverImage?: MulterFile[] },
    ) {
        return success(await this.companiesService.update(id, body as never, files));
    }

    @Patch(':id/status')
    async updateCompanyStatus(@Param('id') id: string, @Body() body: { status: CompanyStatus }) {
        return success(await this.companiesService.update(id, { status: body.status } as never));
    }

    @Delete(':id')
    async deleteCompany(@Param('id') id: string) {
        await this.companiesService.remove(id);
        return success(null);
    }
}