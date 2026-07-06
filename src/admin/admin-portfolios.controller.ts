import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../@types/enums';
import { AdminPlatformService } from './admin-platform.service';
import { paginated, success } from './admin-response';

@Roles(UserRole.ADMIN)
@ApiTags('Admin Portfolios')
@Controller('admin/portfolios')
export class AdminPortfoliosController {
    constructor(
        private readonly portfoliosService: PortfoliosService,
        private readonly adminPlatformService: AdminPlatformService,
    ) {}

    @Get('stats')
    async getPortfolioStats() {
        return success(await this.adminPlatformService.getPortfolioStats());
    }

    @Get('paginate')
    async paginatePortfolios(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('category') category?: string,
        @Query('search') search?: string,
    ) {
        const result = await this.portfoliosService.paginate(Number(page), Number(limit), {
            title: search,
        });

        if (!category) {
            return paginated(result);
        }

        const filtered = result.data.filter(item => item.skills?.includes(category));
        return paginated({
            data: filtered,
            meta: {
                ...result.meta,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / result.meta.limit) || 1,
            },
        });
    }

    @Get('featured')
    async getFeaturedPortfolios() {
        return success(await this.adminPlatformService.getFeaturedPortfolios());
    }

    @Get('categories')
    async getCategories() {
        return success(await this.adminPlatformService.getPortfolioCategories());
    }

    @Get(':id')
    async getPortfolio(@Param('id') id: string) {
        return success(await this.portfoliosService.findOne(id));
    }

    @Patch(':id/feature')
    async featurePortfolio(@Param('id') id: string, @Body() _body: { featured: boolean }) {
        return success(await this.portfoliosService.findOne(id));
    }

    @Delete(':id')
    async deletePortfolio(@Param('id') id: string) {
        await this.portfoliosService.remove(id);
        return success(null);
    }
}