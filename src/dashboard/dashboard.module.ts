import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { JobOffer } from 'src/job-offers/job-offer.entity';
import { DashboardController } from './dashboard.controller';
import { Candidature } from 'src/candidatures/candidature.entity';
import { InterviewSession } from 'src/interview-sessions/interview-session.entity';
import { User } from 'src/users/user.entity';
import { Company } from 'src/companies/company.entity';
import { CVAnalysis } from 'src/cv-analysis/cv-analysis.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([JobOffer, Candidature, InterviewSession, User, Company, CVAnalysis])
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }