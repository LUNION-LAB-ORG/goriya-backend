import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { JobOffersModule } from '../job-offers/job-offers.module';
import { CandidaturesModule } from '../candidatures/candidatures.module';
import { CVAnalysisModule } from '../cv-analysis/cv-analysis.module';
import { InterviewSessionsModule } from '../interview-sessions/interview-sessions.module';
import { MatchingResultsModule } from '../matching-results/matching-results.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { ScoringResultsModule } from '../scoring/scoring-results.module';
import { CalendarEventsModule } from '../calendar-events/calendar-events.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { JobOffer } from '../job-offers/job-offer.entity';
import { Candidature } from '../candidatures/candidature.entity';
import { CVAnalysis } from '../cv-analysis/cv-analysis.entity';
import { InterviewSession } from '../interview-sessions/interview-session.entity';
import { MatchingResult } from '../matching-results/matching-result.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { ScoringResult } from '../scoring/scoring-result.entity';
import { CalendarEvent } from '../calendar-events/calendar-event.entity';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAiController } from './admin-ai.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminCompaniesController } from './admin-companies.controller';
import { AdminJobsController } from './admin-jobs.controller';
import { AdminPlatformService } from './admin-platform.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminPlanningController } from './admin-planning.controller';
import { AdminPortfoliosController } from './admin-portfolios.controller';
import { AdminStudentsController } from './admin-students.controller';
import { AdminSystemController } from './admin-system.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Company,
            JobOffer,
            Candidature,
            CVAnalysis,
            InterviewSession,
            MatchingResult,
            Portfolio,
            ScoringResult,
            CalendarEvent,
        ]),
        AuthModule,
        UsersModule,
        CompaniesModule,
        JobOffersModule,
        CandidaturesModule,
        CVAnalysisModule,
        InterviewSessionsModule,
        MatchingResultsModule,
        PortfoliosModule,
        ScoringResultsModule,
        CalendarEventsModule,
        DashboardModule,
        AnalyticsModule,
    ],
    controllers: [
        AdminAuthController,
        AdminDashboardController,
        AdminAnalyticsController,
        AdminStudentsController,
        AdminCompaniesController,
        AdminJobsController,
        AdminAiController,
        AdminPortfoliosController,
        AdminPlanningController,
        AdminSystemController,
    ],
    providers: [AdminPlatformService],
})
export class AdminModule {}