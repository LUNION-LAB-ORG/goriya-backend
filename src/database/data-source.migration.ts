import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from '../users/user.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Candidature } from '../candidatures/candidature.entity';
import { CalendarEvent } from '../calendar-events/calendar-event.entity';
import { ScoringResult } from '../scoring/scoring-result.entity';
import { JobOffer } from '../job-offers/job-offer.entity';
import { Company } from '../companies/company.entity';
import { MatchingResult } from '../matching-results/matching-result.entity';
import { InterviewSession } from '../interview-sessions/interview-session.entity';
import { CVAnalysis } from '../cv-analysis/cv-analysis.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: '123456789',
    database: 'goriya_db',
    dropSchema: false,
    synchronize: false,
    migrations: ["src/database/migrations/*.ts"],
    entities: [
        User,
        Portfolio,
        Candidature,
        JobOffer,
        Company,
        ScoringResult,
        MatchingResult,
        InterviewSession,
        CVAnalysis,
        CalendarEvent
    ]
});