import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CandidatureStatus, JobStatus } from '../@types/enums';
import { JobOffersService } from '../job-offers/job-offers.service';
import { CandidaturesService } from '../candidatures/candidatures.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { AdminPlatformService } from './admin-platform.service';
import { paginated, success } from './admin-response';

function asArray(value?: string | string[]) {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

@ApiTags('Admin Jobs')
@Controller('admin')
export class AdminJobsController {
    constructor(
        private readonly jobOffersService: JobOffersService,
        private readonly candidaturesService: CandidaturesService,
        private readonly adminPlatformService: AdminPlatformService,
    ) {}

    @Get('job-offers/paginate')
    async paginateJobOffers(
        @Query('search') search?: string,
        @Query('location') location?: string,
        @Query('jobType') jobType?: string | string[],
        @Query('salary') salary?: string | string[],
        @Query('status') status?: JobStatus,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return paginated(await this.jobOffersService.paginate(Number(page), Number(limit), {
            title: search,
            location,
            type: asArray(jobType)[0] as never,
            salary: asArray(salary)[0],
            status,
        }));
    }

    @Get('job-offers/stats')
    async getJobStats() {
        return success(await this.adminPlatformService.getJobOfferStats());
    }

    @Get('job-offers/sectors')
    async getJobSectors() {
        return success(await this.adminPlatformService.getJobOfferSectors());
    }

    @Post('job-offers')
    async createJobOffer(@Body() body: Record<string, unknown>) {
        return success(await this.jobOffersService.create(body as never));
    }

    @Post('job-offers/:jobId/apply')
    async applyToJob(@Param('jobId') jobId: string, @CurrentUser() user: { id: string }) {
        return success(await this.adminPlatformService.createJobApplication(user.id, jobId));
    }

    @Post('job-offers/:jobId/save')
    async saveJob(@Param('jobId') jobId: string, @CurrentUser() user: { id: string }) {
        await this.adminPlatformService.saveJob(jobId, user.id);
        return success(null);
    }

    @Delete('job-offers/:jobId/save')
    async unsaveJob(@Param('jobId') jobId: string, @CurrentUser() user: { id: string }) {
        await this.adminPlatformService.unsaveJob(jobId, user.id);
        return success(null);
    }

    @Get('job-offers/:id')
    async getJobOffer(@Param('id') id: string) {
        return success(await this.jobOffersService.findOne(id));
    }

    @Patch('job-offers/:id')
    async updateJobOffer(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return success(await this.jobOffersService.update(id, body as never));
    }

    @Patch('job-offers/:id/status')
    async updateJobStatus(@Param('id') id: string, @Body() body: { status: JobStatus }) {
        return success(await this.jobOffersService.update(id, { status: body.status } as never));
    }

    @Delete('job-offers/:id')
    async deleteJobOffer(@Param('id') id: string) {
        await this.jobOffersService.remove(id);
        return success(null);
    }

    @Get('candidatures/paginate')
    async paginateCandidatures(@Query('page') page = '1', @Query('limit') limit = '10', @Query('status') status?: CandidatureStatus) {
        return paginated(await this.candidaturesService.paginate(Number(page), Number(limit), { status }));
    }

    @Get('candidatures/stats')
    async getCandidatureStats() {
        return success(await this.adminPlatformService.getCandidatureStats());
    }

    @Get('candidatures/:id')
    async getCandidature(@Param('id') id: string) {
        return success(await this.candidaturesService.findOne(id));
    }

    @Patch('candidatures/:id/status')
    async updateCandidatureStatus(@Param('id') id: string, @Body() body: { status: CandidatureStatus }) {
        return success(await this.candidaturesService.update(id, { status: body.status } as never));
    }

    @Delete('candidatures/:id')
    async deleteCandidature(@Param('id') id: string) {
        await this.candidaturesService.remove(id);
        return success(null);
    }
}