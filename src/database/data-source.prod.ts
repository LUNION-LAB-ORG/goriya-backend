import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
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
import MainSeeder from './seeders/main.seeder';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

// ⚠️ Ce data source cible la base de PRODUCTION (identifiants lus depuis .env).
// dropSchema + synchronize efface tout le schéma existant avant de reseeder :
// à n'exécuter qu'en connaissance de cause (npm run seed:prod).
export const AppDataSourceProd = new DataSource({
    type: 'postgres',
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT) || 5432,
    username: requireEnv('DB_USERNAME'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_DATABASE'),

    dropSchema: true,
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

    seeds: [MainSeeder],
} as DataSourceOptions & SeederOptions);
