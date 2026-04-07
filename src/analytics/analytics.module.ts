import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { CVAnalysis } from 'src/cv-analysis/cv-analysis.entity';
import { InterviewSession } from 'src/interview-sessions/interview-session.entity';
import { MatchingResult } from 'src/matching-results/matching-result.entity';
import { Candidature } from 'src/candidatures/candidature.entity';
import { User } from 'src/users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CVAnalysis, InterviewSession, MatchingResult, Candidature, User]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule {}
