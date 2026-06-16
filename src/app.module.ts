import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller'
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { MatchingResultsModule } from './matching-results/matching-results.module';
import { ScoringResultsModule } from './scoring/scoring-results.module';
import { CVAnalysisModule } from './cv-analysis/cv-analysis.module';
import { InterviewSessionsModule } from './interview-sessions/interview-sessions.module';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';
import { AnthropicModule } from './anthropic/anthropic.module';
import { WaveModule } from './wave/wave.module';
import { AnonymousUsageModule } from './anonymous-usage/anonymous-usage.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // 🔥 OBLIGATOIRE POUR LE CHARGEMENT DES VARIABLES DE .env
        }),
        TypeOrmModule.forRoot(databaseConfig),

        AnthropicModule,
        WaveModule,
        AnonymousUsageModule,
        SubscriptionsModule,
        AuthModule,
        AdminModule,
        UsersModule,
        CompaniesModule,
        JobOffersModule,
        CandidaturesModule,
        PortfoliosModule,
        MatchingResultsModule,
        ScoringResultsModule,
        CVAnalysisModule,
        InterviewSessionsModule,
        CalendarEventsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
