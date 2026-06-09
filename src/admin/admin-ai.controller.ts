import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CVStatus, InterviewStatus, MatchingStatus, ScoringStatus } from '../@types/enums';
import { CVAnalysisService } from '../cv-analysis/cv-analysis.service';
import { InterviewSessionsService } from '../interview-sessions/interview-sessions.service';
import { MatchingResultsService } from '../matching-results/matching-results.service';
import { ScoringResultsService } from '../scoring/scoring-results.service';
import { AdminPlatformService } from './admin-platform.service';
import { paginated, success } from './admin-response';
import type { UploadedFile as MulterFile } from '../@types/utils';

@ApiTags('Admin AI')
@Controller('admin')
export class AdminAiController {
    constructor(
        private readonly cvAnalysisService: CVAnalysisService,
        private readonly interviewSessionsService: InterviewSessionsService,
        private readonly matchingResultsService: MatchingResultsService,
        private readonly scoringResultsService: ScoringResultsService,
        private readonly adminPlatformService: AdminPlatformService,
    ) {}

    @Get('cv-analysis/stats')
    async getCvStats() {
        return success(await this.adminPlatformService.getCvAnalysisStats());
    }

    @Get('cv-analysis/recent')
    async getRecentCvAnalysis(@Query('page') page = '1', @Query('limit') limit = '10', @Query('status') status?: CVStatus) {
        return paginated(await this.cvAnalysisService.paginate(Number(page), Number(limit), { status }));
    }

    @Get('cv-analysis/recommendations')
    async getRecommendations() {
        return success(await this.adminPlatformService.getCvRecommendations());
    }

    @Get('cv-analysis/:id')
    async getCvAnalysis(@Param('id') id: string) {
        return success(await this.cvAnalysisService.findOne(id));
    }

    @Post('cv/analyze')
    @UseInterceptors(FileInterceptor('cv'))
    async analyzeCv(@UploadedFile() file: MulterFile) {
        return success(await this.adminPlatformService.analyzeCv(file));
    }

    @Post('cv/upload')
    @UseInterceptors(FileInterceptor('cv'))
    async uploadCv(@UploadedFile() file: MulterFile) {
        return success(await this.adminPlatformService.createCvUpload(file));
    }

    @Delete('cv-analysis/:id')
    async deleteCvAnalysis(@Param('id') id: string) {
        await this.cvAnalysisService.remove(id);
        return success(null);
    }

    @Get('interview-simulation/stats')
    async getInterviewStats() {
        return success(await this.adminPlatformService.getInterviewStats());
    }

    @Get('interview-simulation/sessions')
    async getInterviewSessions(@Query('page') page = '1', @Query('limit') limit = '10', @Query('status') status?: InterviewStatus) {
        return paginated(await this.interviewSessionsService.paginate(Number(page), Number(limit), { status }));
    }

    @Get('interview-simulation/active')
    async getActiveInterviewSessions() {
        return success(await this.adminPlatformService.getActiveInterviewSessions());
    }

    @Get('interview-simulation/history')
    async getInterviewHistory(@Query('page') page = '1', @Query('limit') limit = '10') {
        return paginated(await this.adminPlatformService.getInterviewHistory(Number(page), Number(limit)));
    }

    @Get('interview-simulation/sessions/:id')
    async getInterviewSession(@Param('id') id: string) {
        return success(await this.interviewSessionsService.findOne(id));
    }

    @Post('interview-simulation/start')
    async startInterview(@Body() body: { candidateId: string; position: string }) {
        return success(await this.adminPlatformService.createInterviewSimulation(body.candidateId, body.position));
    }

    @Patch('interview-simulation/sessions/:sessionId/end')
    async endInterview(@Param('sessionId') sessionId: string, @Body() body: { feedback: string }) {
        return success(await this.interviewSessionsService.update(sessionId, {
            feedback: body.feedback,
            status: InterviewStatus.COMPLETED,
        } as never));
    }

    @Delete('interview-simulation/sessions/:id')
    async deleteInterview(@Param('id') id: string) {
        await this.interviewSessionsService.remove(id);
        return success(null);
    }

    @Get('matching/stats')
    async getMatchingStats() {
        return success(await this.adminPlatformService.getMatchingStats());
    }

    @Get('matching/recent')
    async getRecentMatching(@Query('page') page = '1', @Query('limit') limit = '10', @Query('status') status?: MatchingStatus) {
        return paginated(await this.matchingResultsService.paginate(Number(page), Number(limit), { status }));
    }

    @Get('matching/algorithms')
    async getMatchingAlgorithms() {
        return success(await this.adminPlatformService.getMatchingAlgorithms());
    }

    @Get('matching/activity')
    async getMatchingActivity() {
        return success(await this.adminPlatformService.getMatchingActivity());
    }

    @Post('matching/trigger')
    async triggerMatching(@Body() body: { candidateId: string; jobOfferId: string }) {
        return success(await this.adminPlatformService.triggerMatching(body.candidateId, body.jobOfferId));
    }

    @Patch('matching/:id/status')
    async updateMatchingStatus(@Param('id') id: string, @Body() body: { status: MatchingStatus }) {
        return success(await this.matchingResultsService.update(id, { status: body.status } as never));
    }

    @Get('scoring/stats')
    async getScoringStats() {
        return success(await this.adminPlatformService.getScoringStats());
    }

    @Get('scoring/criteria')
    async getScoringCriteria() {
        return success(await this.adminPlatformService.getScoringCriteria());
    }

    @Get('scoring/performance')
    async getScoringPerformance() {
        return success(await this.adminPlatformService.getScoringPerformance());
    }

    @Get('scoring/recent')
    async getRecentScoring(@Query('page') page = '1', @Query('limit') limit = '10', @Query('status') status?: ScoringStatus) {
        return paginated(await this.scoringResultsService.paginate(Number(page), Number(limit), { status }));
    }

    @Get('scoring/:id')
    async getScoringResult(@Param('id') id: string) {
        return success(await this.scoringResultsService.findOne(id));
    }

    @Post('scoring/analyze')
    async analyzeScoring(@Body() body: { candidateId: string; position: string }) {
        return success(await this.adminPlatformService.analyzeScoring(body.candidateId, body.position));
    }

    @Patch('scoring/criteria')
    async updateScoringCriteria(@Body() body: { criteria: Array<{ name: string; weight: number; score: number; maxScore: number }> }) {
        return success(await this.adminPlatformService.updateScoringCriteria(body.criteria));
    }
}