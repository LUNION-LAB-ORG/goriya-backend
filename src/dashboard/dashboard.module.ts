import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { JobOffer } from 'src/job-offers/job-offer.entity';
import { DashboardController } from './dashboard.controller';
import { Candidature } from 'src/candidatures/candidature.entity';
import { InterviewSession } from 'src/interview-sessions/interview-session.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([JobOffer, Candidature, InterviewSession])
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }