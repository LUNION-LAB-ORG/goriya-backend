import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CandidatureStatus } from '../@types/enums';
import { JobOffer } from '../job-offers/job-offer.entity';
import { Candidature } from '../candidatures/candidature.entity';
import { InterviewSession } from '../interview-sessions/interview-session.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(JobOffer)
        private readonly jobOfferRepo: Repository<JobOffer>,

        @InjectRepository(Candidature)
        private readonly candidatureRepo: Repository<Candidature>,

        @InjectRepository(InterviewSession)
        private readonly interviewRepo: Repository<InterviewSession>,
    ) {}

    async getStats(filters?: { startDate?: Date; endDate?: Date }) {
        const start = filters?.startDate;
        const end = filters?.endDate;

        // 🔹 Stats globales
        const totalOffers = await this.jobOfferRepo.count({
            where: start && end ? { publishDate: Between(start, end) } : {},
        });

        const totalCandidatures = await this.candidatureRepo.count({
            where: start && end ? { appliedDate: Between(start, end) } : {},
        });

        const newCandidatures = await this.candidatureRepo.count({
            where: start && end ? { appliedDate: Between(start, end), status: CandidatureStatus.EN_ATTENTE } : { status: CandidatureStatus.EN_ATTENTE },
        });

        const interviewsPlanned = await this.interviewRepo.count({
            where: start && end ? { startTime: Between(start, end) } : {},
        });

        const statsData = [
            { label: "Offres publiées", value: totalOffers.toString(), icon: "FileText", color: "text-primary" },
            { label: "Candidatures reçues", value: totalCandidatures.toString(), icon: "Users", color: "text-primary" },
            { label: "Nlles candidatures", value: newCandidatures.toString(), icon: "Clock", color: "text-primary" },
            { label: "Entretiens planifiés", value: interviewsPlanned.toString(), icon: "Eye", color: "text-primary" },
        ];

        // 🔹 Evolution hebdomadaire des candidatures (chartData)
        const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
        const chartData: { name: string; value: number }[] = [];
        const today = new Date();
        const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // début de la semaine

        for (let i = 0; i < 7; i++) {
            const dayStart = new Date(monday);
            dayStart.setDate(monday.getDate() + i);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const count = await this.candidatureRepo.count({
                where: { appliedDate: Between(dayStart, dayEnd) },
            });

            chartData.push({ name: weekDays[i], value: count });
        }

        // 🔹 Evolution semestrielle des offres (lineChartData)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
        const lineChartData: { name: string; value: number }[] = [];
        const currentYear = new Date().getFullYear();

        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(currentYear, i, 1);
            const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

            const count = await this.jobOfferRepo.count({
                where: { publishDate: Between(monthStart, monthEnd) },
            });

            lineChartData.push({ name: months[i], value: count });
        }

        // 🔹 Top et récentes offres (ex: dernières 5 offres publiées)
        const recentOffers = await this.jobOfferRepo.find({
            order: { publishDate: 'DESC' },
            take: 5,
            relations: ['company'],
        });

        const topOffers = recentOffers.slice(0, 3).map(o => ({
            title: o.title,
            company: o.company?.name || 'Indéterminée',
        }));

        // 🔹 Candidats récents (dernières 3 candidatures)
        const recentCandidates = await this.candidatureRepo.find({
            order: { appliedDate: 'DESC' },
            take: 3,
        });

        return {
            statsData,
            chartData,
            lineChartData,
            recentCandidates: recentCandidates.map(c => ({
                name: c.candidateName,
                score: c.score,
                avatar: c.candidateName.split(' ').map(n => n[0]).join(''),
            })),
            topOffers,
            recentOffers: recentOffers.map(o => ({
                title: o.title,
                type: o.type,
                location: o.location,
                salary: o.salary,
                status: o.status,
                description: o.description,
            })),
        };
    }
}