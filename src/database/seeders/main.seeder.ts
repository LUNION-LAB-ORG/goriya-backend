import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

// Core entities
import { User } from 'src/users/user.entity';
import { Portfolio } from 'src/portfolios/portfolio.entity';
import { Candidature } from 'src/candidatures/candidature.entity';
import { JobOffer } from 'src/job-offers/job-offer.entity';
import { Company } from 'src/companies/company.entity';

// AI / features entities
import { CVAnalysis } from 'src/cv-analysis/cv-analysis.entity';
import { ScoringResult } from 'src/scoring/scoring-result.entity';
import { CalendarEvent } from 'src/calendar-events/calendar-event.entity';
import { MatchingResult } from 'src/matching-results/matching-result.entity';
import { InterviewSession } from 'src/interview-sessions/interview-session.entity';

// Enums
import {
    UserRole,
    UserStatus,
    CandidatureStatus,
    JobStatus,
    JobType,
    JobExperienceType,
    CompanyStatus,
    ScoringStatus,
    MatchingStatus,
    InterviewStatus,
    CVStatus,
    EventStatus,
    EventType
} from 'src/@types/enums';

export default class MainSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<any> {

        const userRepo = dataSource.getRepository(User);
        const portfolioRepo = dataSource.getRepository(Portfolio);
        const candidatureRepo = dataSource.getRepository(Candidature);
        const jobRepo = dataSource.getRepository(JobOffer);
        const companyRepo = dataSource.getRepository(Company);

        const scoringRepo = dataSource.getRepository(ScoringResult);
        const matchingRepo = dataSource.getRepository(MatchingResult);
        const interviewRepo = dataSource.getRepository(InterviewSession);
        const cvRepo = dataSource.getRepository(CVAnalysis);
        const eventRepo = dataSource.getRepository(CalendarEvent);

        // -------------------------
        // 1. COMPANIES (AVANT USERS maintenant)
        // -------------------------
        const companies = await companyRepo.save(
            Array.from({ length: 5 }).map(() => ({
                name: faker.company.name(),
                sector: faker.commerce.department(),
                logo: faker.image.url(),
                status: CompanyStatus.ACTIVE,
                partnershipDate: faker.date.past(),
            }))
        );

        console.log('✅ Companies');

        // -------------------------
        // 2. USERS (avec company)
        // -------------------------
        const users = await userRepo.save(
            await Promise.all(
                Array.from({ length: 10 }).map(async (_, i) => {
                    const isEnterprise = i % 3 === 0; // 🔥 1 user sur 3 = entreprise

                    return {
                        name: faker.person.fullName(),
                        email: faker.internet.email(),
                        password: await bcrypt.hash('password123', 10),
                        role: isEnterprise ? UserRole.ENTERPRISE : (i === 0 ? UserRole.ADMIN : UserRole.USER),
                        status: UserStatus.ACTIVE,
                        avatar: faker.image.avatar(),

                        // 🔥 liaison avec company
                        company: isEnterprise
                            ? faker.helpers.arrayElement(companies)
                            : undefined,
                    };
                })
            )
        );

        console.log('✅ Users');

        // -------------------------
        // 3. JOB OFFERS (filtrées par users entreprise)
        // -------------------------
        const jobs: JobOffer[] = [];

        const enterpriseUsers = users.filter(u => u.role === UserRole.ENTERPRISE);

        for (const user of enterpriseUsers) {
            if (!user.company) continue;

            const jobList = await jobRepo.save(
                Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
                    title: faker.person.jobTitle(),
                    location: faker.location.city(),
                    type: faker.helpers.arrayElement(Object.values(JobType)),
                    experience: faker.helpers.arrayElement(Object.values(JobExperienceType)),
                    salary: `${faker.number.int({ min: 300, max: 3000 })} USD`,
                    description: faker.lorem.paragraph(),
                    benefits: faker.lorem.paragraph(),
                    requirements: faker.helpers.arrayElements(
                        ['NestJS', 'React', 'Flutter', 'NodeJS', 'Laravel'],
                        3
                    ),
                    status: JobStatus.ACTIVE,
                    applicants: 0,
                    company: user.company, // 🔥 cohérent
                }))
            );

            jobs.push(...jobList);
        }

        console.log('✅ JobOffers');

        // -------------------------
        // 4. PORTFOLIOS (inchangé)
        // -------------------------
        await portfolioRepo.save(
            users.flatMap(user =>
                Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
                    title: faker.person.jobTitle(),
                    description: faker.lorem.paragraph(),
                    skills: faker.helpers.arrayElements(
                        ['NestJS', 'React', 'Flutter', 'NodeJS', 'Laravel'],
                        3
                    ),
                    views: faker.number.int(500),
                    downloads: faker.number.int(100),
                    likes: faker.number.int(200),
                    createdDate: faker.date.past(),
                    user,
                }))
            )
        );

        console.log('✅ Portfolios');

        // -------------------------
        // 5. CANDIDATURES (uniquement USER)
        // -------------------------
        const candidateUsers = users.filter(u => u.role === UserRole.USER);

        const candidatures = await candidatureRepo.save(
            candidateUsers.flatMap(user =>
                Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => {
                    const job = faker.helpers.arrayElement(jobs);

                    job.applicants++;

                    return {
                        candidateName: user.name,
                        candidateEmail: user.email,
                        status: faker.helpers.arrayElement(Object.values(CandidatureStatus)),
                        score: faker.number.int(100),
                        appliedDate: faker.date.recent(),
                        user,
                        jobOffer: job,
                    };
                })
            )
        );

        await jobRepo.save(jobs);

        console.log('✅ Candidatures');

        // -------------------------
        // 6. SCORING (basé sur candidatures)
        // -------------------------
        await scoringRepo.save(
            candidatures.map(c => ({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                overallScore: c.score, // 🔥 cohérence
                criteria: {
                    experience: faker.number.int(100),
                    skills: faker.number.int(100),
                    education: faker.number.int(100),
                },
                analysisDate: faker.date.recent(),
                status: faker.helpers.arrayElement(Object.values(ScoringStatus)),
            }))
        );

        console.log('✅ ScoringResults');

        // -------------------------
        // 7. MATCHING
        // -------------------------
        await matchingRepo.save(
            candidatures.map(c => ({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                company: c.jobOffer.company.name,
                matchingScore: faker.number.int(100),
                status: faker.helpers.arrayElement(Object.values(MatchingStatus)),
                matchDate: faker.date.recent(),
            }))
        );

        console.log('✅ MatchingResults');

        // -------------------------
        // 8. INTERVIEWS
        // -------------------------
        await interviewRepo.save(
            candidatures.map(c => ({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                duration: faker.number.int({ min: 15, max: 90 }),
                score: faker.number.int(100),
                status: faker.helpers.arrayElement(Object.values(InterviewStatus)),
                startTime: faker.date.recent(),
                feedback: faker.lorem.sentence(),
            }))
        );

        console.log('✅ Interviews');

        // -------------------------
        // 9. CV ANALYSIS
        // -------------------------
        await cvRepo.save(
            users.map(u => ({
                fileName: `${u.name}_cv.pdf`,
                analysisScore: faker.number.int(100),
                recommendations: faker.helpers.arrayElements(
                    ['Improve skills', 'Add projects', 'Update experience'],
                    2
                ),
                uploadDate: faker.date.recent(),
                status: faker.helpers.arrayElement(Object.values(CVStatus)),
            }))
        );

        console.log('✅ CV Analysis');

        // -------------------------
        // 10. CALENDAR EVENTS
        // -------------------------
        await eventRepo.save(
            candidatures.map(c => ({
                title: `Interview - ${c.candidateName}`,
                type: EventType.ENTRETIEN, // 🔥 plus réaliste
                startTime: faker.date.future(),
                endTime: faker.date.future(),
                participants: [c.candidateEmail],
                location: faker.location.city(),
                status: EventStatus.CONFIRMED,
            }))
        );

        console.log('✅ Calendar Events');
    }
}