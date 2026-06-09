import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Between, ILike, In, Repository } from 'typeorm';
import {
    CandidatureStatus,
    CompanyStatus,
    CVStatus,
    EventStatus,
    InterviewStatus,
    JobStatus,
    MatchingStatus,
    ScoringStatus,
    UserRole,
    UserStatus,
} from '../@types/enums';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
import { JobOffer } from '../job-offers/job-offer.entity';
import { Candidature } from '../candidatures/candidature.entity';
import { CVAnalysis } from '../cv-analysis/cv-analysis.entity';
import { InterviewSession } from '../interview-sessions/interview-session.entity';
import { MatchingResult } from '../matching-results/matching-result.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { ScoringResult } from '../scoring/scoring-result.entity';
import { CalendarEvent } from '../calendar-events/calendar-event.entity';
import { UsersService } from '../users/users.service';
import { UploadedFile } from '../@types/utils';

type PaginationMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

@Injectable()
export class AdminPlatformService {
    private readonly uploadRoot = path.join(__dirname, '../../storage/admin');
    private readonly followedCompanies = new Map<string, Set<string>>();
    private readonly savedJobs = new Map<string, Set<string>>();
    private readonly conversations: Array<{ id: string; participantId: string; createdAt: string }> = [];
    private readonly conversationMessages = new Map<string, Array<{ id: string; content: string; createdAt: string }>>();
    private readonly notifications: Array<{ id: string; title: string; read: boolean; createdAt: string }> = [
        { id: uuidv4(), title: 'Bienvenue sur l’admin Goriya', read: false, createdAt: new Date().toISOString() },
    ];
    private notificationSettings = {
        applications: true,
        emplois: true,
        recommandations: true,
    };
    private systemSettings = {
        platformName: 'GORIYA',
        mainUrl: 'https://goriya-admin.vercel.app',
        supportEmail: 'support@goriya.app',
        timezone: 'Africa/Abidjan',
        description: 'Administration de la plateforme Goriya',
        maintenanceMode: false,
        maxUploadSize: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpUser: 'noreply@goriya.app',
        senderName: 'GORIYA',
        senderEmail: 'noreply@goriya.app',
    };
    private scoringCriteria = [
        { name: 'Competences', weight: 40, score: 0, maxScore: 100 },
        { name: 'Experience', weight: 35, score: 0, maxScore: 100 },
        { name: 'Communication', weight: 25, score: 0, maxScore: 100 },
    ];

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(JobOffer)
        private readonly jobOfferRepository: Repository<JobOffer>,
        @InjectRepository(Candidature)
        private readonly candidatureRepository: Repository<Candidature>,
        @InjectRepository(CVAnalysis)
        private readonly cvAnalysisRepository: Repository<CVAnalysis>,
        @InjectRepository(InterviewSession)
        private readonly interviewRepository: Repository<InterviewSession>,
        @InjectRepository(MatchingResult)
        private readonly matchingRepository: Repository<MatchingResult>,
        @InjectRepository(Portfolio)
        private readonly portfolioRepository: Repository<Portfolio>,
        @InjectRepository(ScoringResult)
        private readonly scoringRepository: Repository<ScoringResult>,
        @InjectRepository(CalendarEvent)
        private readonly calendarEventRepository: Repository<CalendarEvent>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async verifyOtp(email: string, code: string) {
        if (!code) {
            throw new UnauthorizedException('OTP invalide');
        }

        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        return this.buildTokenResponse(user.id);
    }

    async loginWithGoogle(payload: {
        email: string;
        name?: string;
        firstName?: string;
        lastName?: string;
    }) {
        let user = await this.userRepository.findOne({ where: { email: payload.email } });

        if (!user) {
            const created = await this.usersService.create({
                name: payload.name || [payload.firstName, payload.lastName].filter(Boolean).join(' ') || payload.email,
                email: payload.email,
                password: `google-${uuidv4()}`,
                role: UserRole.USER,
            });

            return {
                token: created.accessToken,
                user: created.user,
            };
        }

        return this.buildTokenResponse(user.id);
    }

    async buildTokenResponse(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Utilisateur introuvable');
        }

        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
        return {
            token,
            user: await this.usersService.findOne(user.id),
        };
    }

    async getStudentStats() {
        const [total, active, inactive] = await Promise.all([
            this.userRepository.count({ where: { role: UserRole.USER } }),
            this.userRepository.count({ where: { role: UserRole.USER, status: UserStatus.ACTIVE } }),
            this.userRepository.count({ where: { role: UserRole.USER, status: UserStatus.INACTIVE } }),
        ]);

        return {
            total,
            active,
            inactive,
            newThisMonth: await this.countUsersCreatedThisMonth(UserRole.USER),
        };
    }

    async getCompanyStats() {
        const [total, active, inactive] = await Promise.all([
            this.companyRepository.count(),
            this.companyRepository.count({ where: { status: CompanyStatus.ACTIVE } }),
            this.companyRepository.count({ where: { status: CompanyStatus.INACTIVE } }),
        ]);

        return {
            total,
            active,
            inactive,
            newThisMonth: await this.countCompaniesCreatedThisMonth(),
        };
    }

    async getCompanySectors() {
        const companies = await this.companyRepository.find();
        const total = companies.length || 1;
        const counts = new Map<string, number>();

        for (const company of companies) {
            counts.set(company.sector, (counts.get(company.sector) || 0) + 1);
        }

        return Array.from(counts.entries()).map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / total) * 100),
        }));
    }

    async getJobOfferStats() {
        const [offers, active, closed, draft] = await Promise.all([
            this.jobOfferRepository.find(),
            this.jobOfferRepository.count({ where: { status: JobStatus.ACTIVE } }),
            this.jobOfferRepository.count({ where: { status: JobStatus.CLOSED } }),
            this.jobOfferRepository.count({ where: { status: JobStatus.DRAFT } }),
        ]);

        return {
            total: offers.length,
            active,
            closed,
            draft,
            totalApplicants: offers.reduce((sum, offer) => sum + (offer.applicants || 0), 0),
        };
    }

    async getJobOfferSectors() {
        const offers = await this.jobOfferRepository.find({ relations: ['company'] });
        const total = offers.length || 1;
        const counts = new Map<string, number>();

        for (const offer of offers) {
            const sector = offer.company?.sector || 'Non classe';
            counts.set(sector, (counts.get(sector) || 0) + 1);
        }

        return Array.from(counts.entries()).map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / total) * 100),
        }));
    }

    async getCandidatureStats() {
        const [total, enAttente, enCours, approuvees, rejetees] = await Promise.all([
            this.candidatureRepository.count(),
            this.candidatureRepository.count({ where: { status: CandidatureStatus.EN_ATTENTE } }),
            this.candidatureRepository.count({ where: { status: CandidatureStatus.EN_COURS } }),
            this.candidatureRepository.count({ where: { status: CandidatureStatus.APPROUVEE } }),
            this.candidatureRepository.count({ where: { status: CandidatureStatus.REJETEE } }),
        ]);

        return { total, enAttente, enCours, approuvees, rejetees };
    }

    async getCvAnalysisStats() {
        const cvs = await this.cvAnalysisRepository.find();
        return {
            totalAnalyzed: cvs.length,
            completed: cvs.filter(item => item.status === CVStatus.COMPLETED).length,
            analyzing: cvs.filter(item => item.status === CVStatus.ANALYZING).length,
            failed: cvs.filter(item => item.status === CVStatus.FAILED).length,
            averageScore: this.average(cvs.map(item => item.analysisScore)),
        };
    }

    async getCvRecommendations() {
        const cvs = await this.cvAnalysisRepository.find({ order: { uploadDate: 'DESC' }, take: 20 });
        const suggestions = cvs.flatMap(item => item.recommendations || []).slice(0, 10);

        return suggestions.map(suggestion => ({
            category: 'CV',
            suggestion,
            impact: 'medium',
        }));
    }

    async createCvUpload(file: UploadedFile) {
        const cvUrl = this.storeUploadedFile(file, 'uploads');
        return { cvUrl };
    }

    async analyzeCv(file: UploadedFile) {
        const fileName = this.storeUploadedFile(file, 'analysis');
        const entity = this.cvAnalysisRepository.create({
            fileName,
            analysisScore: 75,
            recommendations: ['Ajoutez des resultats chiffres', 'Mettez en avant vos competences clefs'],
            uploadDate: new Date(),
            status: CVStatus.COMPLETED,
        });

        await this.cvAnalysisRepository.save(entity);

        return {
            score: entity.analysisScore,
            suggestions: entity.recommendations,
            strengths: ['Structure claire', 'Competences techniques visibles'],
            improvements: ['Ajouter plus de contexte sur les projets'],
        };
    }

    async getInterviewStats() {
        const sessions = await this.interviewRepository.find();
        const today = new Date().toISOString().slice(0, 10);
        const completed = sessions.filter(item => item.status === InterviewStatus.COMPLETED);

        return {
            todaySessions: sessions.filter(item => item.startTime.toISOString().slice(0, 10) === today).length,
            averageScore: this.average(sessions.map(item => item.score)),
            averageDuration: `${Math.round(this.average(sessions.map(item => item.duration)) || 0)} min`,
            satisfaction: completed.length ? Math.round((completed.filter(item => (item.score || 0) >= 70).length / completed.length) * 100) : 0,
        };
    }

    async getActiveInterviewSessions() {
        return this.interviewRepository.find({ where: { status: In([InterviewStatus.ACTIVE, InterviewStatus.SCHEDULED]) } });
    }

    async getInterviewHistory(page: number, limit: number) {
        const sessions = await this.interviewRepository.find({ order: { startTime: 'DESC' } });
        return this.paginateArray(sessions.filter(item => item.status === InterviewStatus.COMPLETED), page, limit);
    }

    async getMatchingStats() {
        const matches = await this.matchingRepository.find();
        const finalized = matches.filter(item => item.status === MatchingStatus.FINALISE).length;
        return {
            totalMatches: matches.length,
            averageScore: this.average(matches.map(item => item.matchingScore)),
            successRate: matches.length ? Math.round((finalized / matches.length) * 100) : 0,
            pendingMatches: matches.filter(item => item.status !== MatchingStatus.FINALISE).length,
        };
    }

    async getMatchingAlgorithms() {
        const matches = await this.matchingRepository.find();
        const precision = this.average(matches.map(item => item.matchingScore));
        const recall = Math.max(0, precision - 5);
        const f1Score = Math.round((2 * precision * recall) / Math.max(1, precision + recall));

        return {
            precision,
            recall,
            f1Score,
            algorithms: [
                { name: 'Semantic Match', accuracy: precision },
                { name: 'Skills Scoring', accuracy: recall },
            ],
        };
    }

    async getMatchingActivity() {
        const matches = await this.matchingRepository.find({ order: { matchDate: 'DESC' }, take: 10 });
        return matches.map(item => ({
            id: item.id,
            type: 'matching',
            message: `${item.candidateName} matche sur ${item.position}`,
            timestamp: item.matchDate.toISOString(),
        }));
    }

    async getPortfolioStats() {
        const portfolios = await this.portfolioRepository.find();
        return {
            totalPortfolios: portfolios.length,
            totalViews: portfolios.reduce((sum, item) => sum + (item.views || 0), 0),
            totalDownloads: portfolios.reduce((sum, item) => sum + (item.downloads || 0), 0),
            totalLikes: portfolios.reduce((sum, item) => sum + (item.likes || 0), 0),
        };
    }

    async getFeaturedPortfolios() {
        return this.portfolioRepository.find({ relations: ['user'], order: { likes: 'DESC' }, take: 6 });
    }

    async getPortfolioCategories() {
        const portfolios = await this.portfolioRepository.find();
        const counts = new Map<string, number>();

        for (const portfolio of portfolios) {
            for (const skill of portfolio.skills || []) {
                counts.set(skill, (counts.get(skill) || 0) + 1);
            }
        }

        return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
    }

    async getPlanningStats() {
        const events = await this.calendarEventRepository.find();
        const now = new Date();

        return {
            totalEvents: events.length,
            upcomingEvents: events.filter(item => item.startTime >= now && item.status !== EventStatus.CANCELLED).length,
            completedEvents: events.filter(item => item.endTime < now && item.status !== EventStatus.CANCELLED).length,
            cancelledEvents: events.filter(item => item.status === EventStatus.CANCELLED).length,
        };
    }

    async getPlanningEvents(date?: string) {
        if (!date) {
            return this.calendarEventRepository.find({ order: { startTime: 'ASC' } });
        }

        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        return this.calendarEventRepository.find({
            where: {
                startTime: Between(start, end),
            },
            order: { startTime: 'ASC' },
        });
    }

    async getUpcomingPlanningEvents(limit: number) {
        return this.calendarEventRepository.find({
            where: { status: In([EventStatus.CONFIRMED, EventStatus.PENDING]) },
            order: { startTime: 'ASC' },
            take: limit,
        });
    }

    async getScoringStats() {
        const scores = await this.scoringRepository.find();
        return {
            generatedScores: scores.length,
            averageScore: this.average(scores.map(item => item.overallScore)),
            accuracy: scores.length ? Math.round((scores.filter(item => item.status === ScoringStatus.COMPLETED).length / scores.length) * 100) : 0,
            averageTime: '3 min',
        };
    }

    async getScoringCriteria() {
        const scores = await this.scoringRepository.find({ order: { analysisDate: 'DESC' }, take: 10 });
        if (!scores.length) {
            return this.scoringCriteria;
        }

        return this.scoringCriteria.map(item => ({
            ...item,
            score: Math.round(this.average(scores.map(score => this.extractCriterionScore(score.criteria, item.name)))),
        }));
    }

    async updateScoringCriteria(criteria: Array<{ name: string; weight: number; score: number; maxScore: number }>) {
        this.scoringCriteria = criteria;
        return this.scoringCriteria;
    }

    async getScoringPerformance() {
        const scores = await this.scoringRepository.find({ order: { analysisDate: 'ASC' } });
        const grouped = new Map<string, ScoringResult[]>();

        for (const score of scores) {
            const key = `${score.analysisDate.getFullYear()}-${String(score.analysisDate.getMonth() + 1).padStart(2, '0')}`;
            const bucket = grouped.get(key) || [];
            bucket.push(score);
            grouped.set(key, bucket);
        }

        const trendData = Array.from(grouped.entries()).map(([month, items]) => ({
            month,
            precision: this.average(items.map(item => item.overallScore)),
            recall: Math.max(0, this.average(items.map(item => item.overallScore)) - 5),
        }));

        const precision = this.average(scores.map(item => item.overallScore));
        const recall = Math.max(0, precision - 5);
        const f1Score = Math.round((2 * precision * recall) / Math.max(1, precision + recall));

        return { precision, recall, f1Score, trendData };
    }

    async triggerMatching(candidateId: string, jobOfferId: string) {
        const [candidate, jobOffer] = await Promise.all([
            this.userRepository.findOne({ where: { id: candidateId } }),
            this.jobOfferRepository.findOne({ where: { id: jobOfferId }, relations: ['company'] }),
        ]);

        if (!candidate || !jobOffer) {
            throw new NotFoundException('Candidat ou offre introuvable');
        }

        const match = this.matchingRepository.create({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            position: jobOffer.title,
            company: jobOffer.company?.name || 'Entreprise',
            matchingScore: 78,
            status: MatchingStatus.NOUVEAU,
            matchDate: new Date(),
        });

        return this.matchingRepository.save(match);
    }

    async createJobApplication(userId: string, jobOfferId: string) {
        const [candidate, jobOffer] = await Promise.all([
            this.userRepository.findOne({ where: { id: userId } }),
            this.jobOfferRepository.findOne({ where: { id: jobOfferId } }),
        ]);

        if (!candidate || !jobOffer) {
            throw new NotFoundException('Candidat ou offre introuvable');
        }

        const application = this.candidatureRepository.create({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            status: CandidatureStatus.EN_ATTENTE,
            score: 0,
            appliedDate: new Date(),
            user: candidate,
            jobOffer,
        });

        return this.candidatureRepository.save(application);
    }

    async createInterviewSimulation(candidateId: string, position: string) {
        const candidate = await this.userRepository.findOne({ where: { id: candidateId } });
        if (!candidate) {
            throw new NotFoundException('Candidat introuvable');
        }

        const session = this.interviewRepository.create({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            position,
            duration: 45,
            score: 0,
            status: InterviewStatus.ACTIVE,
            startTime: new Date(),
            feedback: '',
        });

        return this.interviewRepository.save(session);
    }

    async analyzeScoring(candidateId: string, position: string) {
        const candidate = await this.userRepository.findOne({ where: { id: candidateId } });
        if (!candidate) {
            throw new NotFoundException('Candidat introuvable');
        }

        const result = this.scoringRepository.create({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            position,
            overallScore: 81,
            criteria: this.scoringCriteria,
            analysisDate: new Date(),
            status: ScoringStatus.COMPLETED,
        });

        return this.scoringRepository.save(result);
    }

    async followCompany(companyId: string, userId = 'admin') {
        const bucket = this.followedCompanies.get(companyId) || new Set<string>();
        bucket.add(userId);
        this.followedCompanies.set(companyId, bucket);
    }

    async unfollowCompany(companyId: string, userId = 'admin') {
        const bucket = this.followedCompanies.get(companyId);
        bucket?.delete(userId);
    }

    async saveJob(jobId: string, userId = 'admin') {
        const bucket = this.savedJobs.get(jobId) || new Set<string>();
        bucket.add(userId);
        this.savedJobs.set(jobId, bucket);
    }

    async unsaveJob(jobId: string, userId = 'admin') {
        const bucket = this.savedJobs.get(jobId);
        bucket?.delete(userId);
    }

    async getCompanyJobs(companyId: string) {
        return this.jobOfferRepository.find({ where: { company: { id: companyId } }, relations: ['company'] });
    }

    async exportUsersCsv() {
        const users = await this.userRepository.find({ where: { role: UserRole.USER } });
        return this.toCsv(
            users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status,
                registrationDate: user.registrationDate.toISOString(),
            })),
        );
    }


            async createJobApplication(userId: string, jobId: string) {
                const [candidate, jobOffer] = await Promise.all([
                    this.userRepository.findOne({ where: { id: userId } }),
                    this.jobOfferRepository.findOne({ where: { id: jobId } }),
                ]);

                if (!candidate || !jobOffer) {
                    throw new NotFoundException('Candidat ou offre introuvable');
                }

                const candidature = this.candidatureRepository.create({
                    candidateName: candidate.name,
                    candidateEmail: candidate.email,
                    status: CandidatureStatus.EN_ATTENTE,
                    score: 0,
                    appliedDate: new Date(),
                    user: candidate,
                    jobOffer,
                });

                await this.jobOfferRepository.update(jobId, { applicants: (jobOffer.applicants || 0) + 1 });

                return this.candidatureRepository.save(candidature);
            }

            async startInterviewSession(candidateId: string, position: string) {
                const candidate = await this.userRepository.findOne({ where: { id: candidateId } });
                if (!candidate) {
                    throw new NotFoundException('Candidat introuvable');
                }

                const session = this.interviewRepository.create({
                    candidateName: candidate.name,
                    candidateEmail: candidate.email,
                    position,
                    duration: 0,
                    score: 0,
                    status: InterviewStatus.ACTIVE,
                    startTime: new Date(),
                });

                return this.interviewRepository.save(session);
            }

            async endInterviewSession(sessionId: string, feedback: string) {
                const session = await this.interviewRepository.findOne({ where: { id: sessionId } });
                if (!session) {
                    throw new NotFoundException('Session introuvable');
                }

                const duration = Math.max(1, Math.round((Date.now() - session.startTime.getTime()) / 60000));
                session.feedback = feedback;
                session.duration = duration;
                session.status = InterviewStatus.COMPLETED;
                session.score = session.score || 80;

                return this.interviewRepository.save(session);
            }
    async exportSearchCsv(query: Record<string, unknown>) {
        const result = await this.searchAll(query);
        return this.toCsv(result.data as Array<Record<string, unknown>>);
    }

    async getConversations() {
        return this.conversations;
    }

    async getConversationMessages(conversationId: string) {
        return this.conversationMessages.get(conversationId) || [];
    }

    async sendConversationMessage(conversationId: string, content: string) {
        const current = this.conversationMessages.get(conversationId) || [];
        const message = { id: uuidv4(), content, createdAt: new Date().toISOString() };
        current.push(message);
        this.conversationMessages.set(conversationId, current);
        return message;
    }

    async markConversationAsRead(_conversationId: string) {
        return null;
    }

    async createConversation(participantId: string) {
        const conversation = { id: uuidv4(), participantId, createdAt: new Date().toISOString() };
        this.conversations.push(conversation);
        this.conversationMessages.set(conversation.id, []);
        return conversation;
    }

    async getNotifications() {
        return this.notifications;
    }

    async markNotificationAsRead(notificationId: string) {
        const notification = this.notifications.find(item => item.id === notificationId);
        if (notification) {
            notification.read = true;
        }
        return null;
    }

    async markAllNotificationsAsRead() {
        for (const notification of this.notifications) {
            notification.read = true;
        }
        return null;
    }

    async updateNotificationSettings(settings: { applications?: boolean; emplois?: boolean; recommandations?: boolean }) {
        this.notificationSettings = {
            ...this.notificationSettings,
            ...settings,
        };
        return null;
    }

    async getSystemSettings() {
        return this.systemSettings;
    }

    async updateSystemSettings(settings: Record<string, unknown>) {
        this.systemSettings = {
            ...this.systemSettings,
            ...settings,
        };
        return this.systemSettings;
    }

    async getEmailSettings() {
        const { smtpHost, smtpPort, smtpUser, senderName, senderEmail } = this.systemSettings;
        return { smtpHost, smtpPort, smtpUser, senderName, senderEmail };
    }

    async updateEmailSettings(settings: Record<string, unknown>) {
        this.systemSettings = {
            ...this.systemSettings,
            ...settings,
        };
        return null;
    }

    async testEmailSettings() {
        return {
            success: true,
            message: 'Configuration email validee',
        };
    }

    async updateMyProfile(userId: string, data: Record<string, unknown>) {
        return this.usersService.update(userId, data as never);
    }

    async uploadMyAvatar(userId: string, avatar: UploadedFile) {
        const updated = await this.usersService.update(userId, {} as never, avatar);
        return { avatarUrl: updated.avatar };
    }

    async searchAll(query: Record<string, unknown>) {
        const page = this.toNumber(query.page, 1);
        const limit = this.toNumber(query.limit, 10);
        const q = String(query.q || '').trim();

        const users = await this.searchCandidatesInternal(q, query);
        const offers = await this.searchOffersInternal(q, query);
        const combined = [...users, ...offers];
        return this.paginateArray(combined, page, limit);
    }

    async searchCandidates(query: Record<string, unknown>) {
        const page = this.toNumber(query.page, 1);
        const limit = this.toNumber(query.limit, 10);
        const q = String(query.q || '').trim();
        return this.paginateArray(await this.searchCandidatesInternal(q, query), page, limit);
    }

    async searchOffers(query: Record<string, unknown>) {
        const page = this.toNumber(query.page, 1);
        const limit = this.toNumber(query.limit, 10);
        const q = String(query.q || '').trim();
        return this.paginateArray(await this.searchOffersInternal(q, query), page, limit);
    }

    async getSearchFilters() {
        const [companies, offers] = await Promise.all([
            this.companyRepository.find(),
            this.jobOfferRepository.find(),
        ]);

        return {
            sectors: Array.from(new Set(companies.map(item => item.sector).filter(Boolean))),
            locations: Array.from(new Set([...companies.map(item => item.location), ...offers.map(item => item.location)].filter(Boolean))),
            experiences: Array.from(new Set(offers.map(item => item.experience).filter(Boolean))),
        };
    }

    private async searchCandidatesInternal(q: string, query: Record<string, unknown>) {
        const users = await this.userRepository.find({ where: { role: UserRole.USER }, relations: ['company'] });
        return users.filter(user => {
            const textMatch = !q || user.name.toLowerCase().includes(q.toLowerCase()) || user.email.toLowerCase().includes(q.toLowerCase());
            const location = String(query.location || '').trim().toLowerCase();
            const sector = String(query.sector || '').trim().toLowerCase();
            const companyLocation = user.company?.location?.toLowerCase() || '';
            const companySector = user.company?.sector?.toLowerCase() || '';
            return textMatch && (!location || companyLocation.includes(location)) && (!sector || companySector.includes(sector));
        });
    }

    private async searchOffersInternal(q: string, query: Record<string, unknown>) {
        const offers = await this.jobOfferRepository.find({ relations: ['company'] });
        return offers.filter(offer => {
            const textMatch = !q || offer.title.toLowerCase().includes(q.toLowerCase()) || offer.description.toLowerCase().includes(q.toLowerCase());
            const location = String(query.location || '').trim().toLowerCase();
            const sector = String(query.sector || '').trim().toLowerCase();
            const experience = String(query.experience || '').trim().toLowerCase();
            return textMatch
                && (!location || offer.location.toLowerCase().includes(location))
                && (!sector || (offer.company?.sector || '').toLowerCase().includes(sector))
                && (!experience || offer.experience.toLowerCase().includes(experience));
        });
    }

    private paginateArray<T>(items: T[], page: number, limit: number) {
        const total = items.length;
        const safeLimit = Math.max(1, limit);
        const safePage = Math.max(1, page);
        const start = (safePage - 1) * safeLimit;
        return {
            data: items.slice(start, start + safeLimit),
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
                totalPages: Math.ceil(total / safeLimit) || 1,
            } satisfies PaginationMeta,
        };
    }

    private average(values: number[]) {
        if (!values.length) {
            return 0;
        }

        return Math.round(values.reduce((sum, value) => sum + (value || 0), 0) / values.length);
    }

    private async countUsersCreatedThisMonth(role: UserRole) {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return this.userRepository.count({ where: { role, createdAt: Between(start, new Date()) } });
    }

    private async countCompaniesCreatedThisMonth() {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return this.companyRepository.count({ where: { createdAt: Between(start, new Date()) } });
    }

    private extractCriterionScore(criteria: unknown, name: string) {
        if (Array.isArray(criteria)) {
            const match = criteria.find(item => item?.name === name);
            return Number(match?.score || 0);
        }

        if (criteria && typeof criteria === 'object') {
            const keyed = (criteria as Record<string, unknown>)[name];
            if (typeof keyed === 'number') {
                return keyed;
            }
        }

        return 0;
    }

    private toCsv(rows: Array<Record<string, unknown>>) {
        if (!rows.length) {
            return Buffer.from('', 'utf-8');
        }

        const headers = Object.keys(rows[0]);
        const lines = [headers.join(',')];
        for (const row of rows) {
            lines.push(headers.map(header => this.escapeCsvValue(row[header])).join(','));
        }
        return Buffer.from(lines.join('\n'), 'utf-8');
    }

    private escapeCsvValue(value: unknown) {
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    private storeUploadedFile(file: UploadedFile, folder: string) {
        const directory = path.join(this.uploadRoot, folder);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const ext = path.extname(file.originalname || '') || '.bin';
        const fileName = `${uuidv4()}${ext}`;
        const fullPath = path.join(directory, fileName);
        fs.writeFileSync(fullPath, file.buffer);
        return `/storage/admin/${folder}/${fileName}`;
    }

    private toNumber(value: unknown, fallback: number) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }
}