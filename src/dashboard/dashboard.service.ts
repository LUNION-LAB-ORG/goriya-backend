import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyStatus, CVStatus, JobStatus, UserRole, UserStatus } from '../@types/enums';
import { JobOffer } from '../job-offers/job-offer.entity';
import { Candidature } from '../candidatures/candidature.entity';
import { InterviewSession } from '../interview-sessions/interview-session.entity';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { CVAnalysis } from '../cv-analysis/cv-analysis.entity';

type DashboardStatsParams = {
    start?: string;
    end?: string;
};

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepo: Repository<JobOffer>,

        @InjectRepository(Candidature)
        private readonly candidatureRepo: Repository<Candidature>,

        @InjectRepository(InterviewSession)
        private readonly interviewRepo: Repository<InterviewSession>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,

        @InjectRepository(CVAnalysis)
        private readonly cvAnalysisRepo: Repository<CVAnalysis>,
    ) {}

    private parseDate(value?: string): Date | null {
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    private buildRange(params?: DashboardStatsParams): { start: Date; end: Date } | null {
        const start = this.parseDate(params?.start);
        const end = this.parseDate(params?.end);

        if (!start && !end) return null;

        const safeStart = start ?? new Date('1970-01-01T00:00:00.000Z');
        const safeEnd = end ?? new Date();
        return { start: safeStart, end: safeEnd };
    }

    async getStats(params?: DashboardStatsParams) {
        const range = this.buildRange(params);

        const applicationsInRange = range
            ? await this.candidatureRepo.count({ where: { appliedDate: Between(range.start, range.end) } })
            : await this.candidatureRepo.count();

        const offersInRange = range
            ? await this.jobOfferRepo
                .createQueryBuilder('jobOffer')
                .where('jobOffer.publishDate BETWEEN :start AND :end', { start: range.start, end: range.end })
                .getCount()
            : await this.jobOfferRepo.count({ where: { status: JobStatus.ACTIVE } });

        const [activeStudents, partnerCompanies, analyzedCVs, jobOffers, totalApplications, interviews] =
            await Promise.all([
                this.userRepo.count({ where: { role: UserRole.USER, status: UserStatus.ACTIVE } }),
                this.companyRepo.count({ where: { status: CompanyStatus.ACTIVE } }),
                this.cvAnalysisRepo.count({ where: { status: CVStatus.COMPLETED } }),
                offersInRange,
                applicationsInRange,
                this.interviewRepo.count(),
            ]);

        const [recentCandidates, topOffers, recentOffers, chartData, lineChartData] = await Promise.all([
            this.candidatureRepo.find({
                order: { appliedDate: 'DESC' },
                take: 5,
                relations: ['user', 'jobOffer', 'jobOffer.company'],
            }),
            this.jobOfferRepo.find({
                where: { status: JobStatus.ACTIVE },
                order: { applicants: 'DESC' },
                take: 5,
                relations: ['company'],
            }),
            this.jobOfferRepo.find({
                order: { publishDate: 'DESC' },
                take: 5,
                relations: ['company'],
            }),
            this.getPerformanceData('month'),
            this.getRecentOffersTrend(6),
        ]);

        const statsData = [
            { key: 'activeStudents', label: 'Etudiants actifs', value: activeStudents },
            { key: 'partnerCompanies', label: 'Entreprises partenaires', value: partnerCompanies },
            { key: 'jobOffers', label: 'Offres publiees', value: jobOffers },
            { key: 'totalApplications', label: 'Candidatures', value: totalApplications },
            { key: 'interviews', label: 'Entretiens', value: interviews },
            { key: 'analyzedCVs', label: 'CV analyses', value: analyzedCVs },
        ];

        return {
            activeStudents,
            partnerCompanies,
            analyzedCVs,
            jobOffers,
            totalApplications,
            interviews,
            profileViews: 0,
            savedJobs: 0,
            statsData,
            chartData,
            lineChartData,
            recentCandidates,
            topOffers,
            recentOffers,
        };
    }

    private async getRecentOffersTrend(monthCount = 6) {
        const now = new Date();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trend: { month: string; value: number; label: string }[] = [];

        for (let i = monthCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

            const value = await this.jobOfferRepo.count({
                where: { publishDate: Between(monthStart, monthEnd) },
            });

            trend.push({
                month: monthNames[d.getMonth()],
                value,
                label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
            });
        }

        return trend;
    }

    async getPerformanceData(period?: string) {
        const now = new Date();
        const data: { month: string; value: number; label?: string }[] = [];

        if (period === 'week') {
            const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            for (let i = 6; i >= 0; i--) {
                const dayStart = new Date(now);
                dayStart.setDate(now.getDate() - i);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const count = await this.candidatureRepo.count({
                    where: { appliedDate: Between(dayStart, dayEnd) },
                });
                data.push({ month: dayNames[dayStart.getDay()], value: count });
            }
        } else {
            const monthCount = period === 'year' ? 12 : 6;
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

            for (let i = monthCount - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
                const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

                const count = await this.candidatureRepo.count({
                    where: { appliedDate: Between(monthStart, monthEnd) },
                });

                data.push({
                    month: monthNames[d.getMonth()],
                    value: count,
                    label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
                });
            }
        }

        return data;
    }

    async getRecentApplications(limit: number) {
        return this.candidatureRepo.find({
            order: { appliedDate: 'DESC' },
            take: limit,
            relations: ['jobOffer', 'jobOffer.company', 'user'],
        });
    }

    async getRecommendedJobs(limit: number) {
        return this.jobOfferRepo.find({
            where: { status: JobStatus.ACTIVE },
            order: { publishDate: 'DESC' },
            take: limit,
            relations: ['company'],
        });
    }

    async getProfileViews(days: number) {
        const views: { date: string; count: number }[] = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            views.push({
                date: d.toISOString().split('T')[0],
                count: 0,
            });
        }

        return { views, total: 0 };
    }
}