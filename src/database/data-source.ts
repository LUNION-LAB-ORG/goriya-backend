import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { User } from 'src/users/user.entity';
import UserSeeder from './seeders/user.seeder';
import { Portfolio } from 'src/portfolios/portfolio.entity';
import { Candidature } from 'src/candidatures/candidature.entity';
import { CalendarEvent } from 'src/calendar-events/calendar-event.entity';
import { ScoringResult } from 'src/scoring/scoring-result.entity';
import { JobOffer } from 'src/job-offers/job-offer.entity';
import { Company } from 'src/companies/company.entity';
import { MatchingResult } from 'src/matching-results/matching-result.entity';
import { InterviewSession } from 'src/interview-sessions/interview-session.entity';
import { CVAnalysis } from 'src/cv-analysis/cv-analysis.entity';
import MainSeeder from './seeders/main.seeder';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: '123456789',
    database: 'goriya_db',

    dropSchema: true, // DEV
    synchronize: true,

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
    ],

    // 👇 seed config
    seeds: [MainSeeder],
} as DataSourceOptions & SeederOptions);