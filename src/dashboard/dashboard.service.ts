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

    async getStats() {
        const [activeStudents, partnerCompanies, analyzedCVs, jobOffers, totalApplications, interviews] =
            await Promise.all([
                this.userRepo.count({ where: { role: UserRole.USER, status: UserStatus.ACTIVE } }),
                this.companyRepo.count({ where: { status: CompanyStatus.ACTIVE } }),
                this.cvAnalysisRepo.count({ where: { status: CVStatus.COMPLETED } }),
                this.jobOfferRepo.count({ where: { status: JobStatus.ACTIVE } }),
                this.candidatureRepo.count(),
                this.interviewRepo.count(),
            ]);

        return {
            activeStudents,
            partnerCompanies,
            analyzedCVs,
            jobOffers,
            totalApplications,
            interviews,
            profileViews: 0,
            savedJobs: 0,
        };
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