import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CVStatus, InterviewStatus, UserRole } from '../@types/enums';
import { CVAnalysis } from '../cv-analysis/cv-analysis.entity';
import { InterviewSession } from '../interview-sessions/interview-session.entity';
import { MatchingResult } from '../matching-results/matching-result.entity';
import { Candidature } from '../candidatures/candidature.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(CVAnalysis)
        private readonly cvAnalysisRepo: Repository<CVAnalysis>,

        @InjectRepository(InterviewSession)
        private readonly interviewRepo: Repository<InterviewSession>,

        @InjectRepository(MatchingResult)
        private readonly matchingRepo: Repository<MatchingResult>,

        @InjectRepository(Candidature)
        private readonly candidatureRepo: Repository<Candidature>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async getAnalytics() {
        const [analyzedCVs, successfulInterviews, totalMatching, evolutionData, activityDistribution] =
            await Promise.all([
                this.cvAnalysisRepo.count({ where: { status: CVStatus.COMPLETED } }),
                this.interviewRepo.count({ where: { status: InterviewStatus.COMPLETED } }),
                this.matchingRepo
                    .createQueryBuilder('m')
                    .select('AVG(m.matching_score)', 'avg')
                    .getRawOne<{ avg: string | null }>(),
                this.buildEvolutionData('month6'),
                this.buildActivityDistribution(),
            ]);

        const matchingRate = totalMatching?.avg ? Math.round(parseFloat(totalMatching.avg)) : 0;

        return {
            analyzedCVs,
            successfulInterviews,
            matchingRate,
            averageAnalysisTime: '2h 30min',
            evolutionData,
            activityDistribution,
        };
    }

    async getEvolutionData(period: 'week' | 'month' | 'year') {
        return this.buildEvolutionData(period);
    }

    async getActivityDistribution() {
        return this.buildActivityDistribution();
    }

    async getKPIs() {
        const [registrations, cvAnalyzed, interviewsDone, totalMatching] = await Promise.all([
            this.userRepo.count({ where: { role: UserRole.USER } }),
            this.cvAnalysisRepo.count({ where: { status: CVStatus.COMPLETED } }),
            this.interviewRepo.count({ where: { status: InterviewStatus.COMPLETED } }),
            this.matchingRepo
                .createQueryBuilder('m')
                .select('AVG(m.matching_score)', 'avg')
                .getRawOne<{ avg: string | null }>(),
        ]);

        const matchingRate = totalMatching?.avg ? Math.round(parseFloat(totalMatching.avg)) : 0;

        return { registrations, matchingRate, cvAnalyzed, interviewsDone };
    }

    async exportReport(period: string): Promise<Buffer> {
        const [cvCount, interviewCount, matchingRate, kpis] = await Promise.all([
            this.cvAnalysisRepo.count({ where: { status: CVStatus.COMPLETED } }),
            this.interviewRepo.count({ where: { status: InterviewStatus.COMPLETED } }),
            this.matchingRepo
                .createQueryBuilder('m')
                .select('AVG(m.matching_score)', 'avg')
                .getRawOne<{ avg: string | null }>(),
            this.getKPIs(),
        ]);

        const rate = matchingRate?.avg ? Math.round(parseFloat(matchingRate.avg)) : 0;

        const lines = [
            `Rapport Analytics — Période : ${period}`,
            `Généré le : ${new Date().toLocaleDateString('fr-FR')}`,
            '',
            'KPIs',
            `Inscriptions,${kpis.registrations}`,
            `CVs analysés,${cvCount}`,
            `Entretiens réalisés,${interviewCount}`,
            `Taux de matching,${rate}%`,
        ];

        return Buffer.from(lines.join('\n'), 'utf-8');
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    private async buildEvolutionData(period: string): Promise<{ month: string; value: number }[]> {
        const now = new Date();
        const data: { month: string; value: number }[] = [];

        if (period === 'week') {
            const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            for (let i = 6; i >= 0; i--) {
                const dayStart = new Date(now);
                dayStart.setDate(now.getDate() - i);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const count = await this.cvAnalysisRepo.count({
                    where: { uploadDate: Between(dayStart, dayEnd) },
                });
                data.push({ month: dayNames[dayStart.getDay()], value: count });
            }
        } else if (period === 'month') {
            const weekLabels = ['S1', 'S2', 'S3', 'S4'];
            for (let i = 0; i < 4; i++) {
                const weekStart = new Date(now.getFullYear(), now.getMonth(), i * 7 + 1);
                const weekEnd = new Date(now.getFullYear(), now.getMonth(), i * 7 + 7, 23, 59, 59, 999);

                const count = await this.cvAnalysisRepo.count({
                    where: { uploadDate: Between(weekStart, weekEnd) },
                });
                data.push({ month: weekLabels[i], value: count });
            }
        } else {
            const monthCount = period === 'year' ? 12 : 6;
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

            for (let i = monthCount - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
                const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

                const count = await this.cvAnalysisRepo.count({
                    where: { uploadDate: Between(monthStart, monthEnd) },
                });
                data.push({ month: monthNames[d.getMonth()], value: count });
            }
        }

        return data;
    }

    private async buildActivityDistribution(): Promise<{ name: string; value: number; color: string }[]> {
        const [cvs, candidatures, interviews, matchings] = await Promise.all([
            this.cvAnalysisRepo.count(),
            this.candidatureRepo.count(),
            this.interviewRepo.count(),
            this.matchingRepo.count(),
        ]);

        return [
            { name: 'CVs analysés', value: cvs, color: '#6366f1' },
            { name: 'Candidatures', value: candidatures, color: '#22c55e' },
            { name: 'Entretiens', value: interviews, color: '#f59e0b' },
            { name: 'Matching', value: matchings, color: '#ec4899' },
        ];
    }
}
