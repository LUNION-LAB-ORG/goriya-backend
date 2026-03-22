import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

// Core entities
import { User } from '../../users/user.entity';
import { Portfolio } from '../../portfolios/portfolio.entity';
import { Candidature } from '../../candidatures/candidature.entity';
import { JobOffer } from '../../job-offers/job-offer.entity';
import { Company } from '../../companies/company.entity';

// AI / features entities
import { CVAnalysis } from '../../cv-analysis/cv-analysis.entity';
import { ScoringResult } from '../../scoring/scoring-result.entity';
import { CalendarEvent } from '../../calendar-events/calendar-event.entity';
import { MatchingResult } from '../../matching-results/matching-result.entity';
import { InterviewSession } from '../../interview-sessions/interview-session.entity';

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
} from '../../@types/enums';

export default class MainSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {

        const companyRepo = dataSource.getRepository(Company);
        const userRepo = dataSource.getRepository(User);
        const jobRepo = dataSource.getRepository(JobOffer);
        const portfolioRepo = dataSource.getRepository(Portfolio);
        const candidatureRepo = dataSource.getRepository(Candidature);
        const scoringRepo = dataSource.getRepository(ScoringResult);
        const matchingRepo = dataSource.getRepository(MatchingResult);
        const interviewRepo = dataSource.getRepository(InterviewSession);
        const cvRepo = dataSource.getRepository(CVAnalysis);
        const eventRepo = dataSource.getRepository(CalendarEvent);

        // -------------------------
        // 1. COMPANIES
        // -------------------------
        const companies = await companyRepo.save(
            Array.from({ length: 20 }).map(() => companyRepo.create({
                name: faker.company.name(),
                sector: faker.commerce.department(),
                logo: faker.image.urlPicsumPhotos(),
                coverImage: faker.image.urlPicsumPhotos(),
                about: faker.company.catchPhrase(),
                creationDate: faker.date.past({ years: 10 }),
                partnershipDate: faker.date.recent(),
                companySize: faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']),
                website: faker.internet.url(),
                socialLinks: [
                    faker.internet.url(),
                    faker.internet.url(),
                    faker.internet.url()
                ],
                country: faker.location.country(),
                headquarters: faker.location.city(),
                location: faker.location.city(),
                phone: faker.phone.number(),
                email: faker.internet.email(),
                status: faker.helpers.arrayElement(Object.values(CompanyStatus)),
            }))
        );
        console.log('✅ Companies seeded');

        // -------------------------
        // 2. USERS
        // -------------------------
        const users = await userRepo.save(
            await Promise.all(
                Array.from({ length: 30 }).map(async (_, i) => {
                    const isEnterprise = i % 3 === 0;

                    return userRepo.create({
                        name: faker.person.fullName(),
                        email: faker.internet.email(),
                        password: await bcrypt.hash('password123', 10),
                        role: isEnterprise ? UserRole.ENTERPRISE : (i === 0 ? UserRole.ADMIN : UserRole.USER),
                        status: UserStatus.ACTIVE,
                        avatar: faker.image.avatar(),
                        company: isEnterprise ? faker.helpers.arrayElement(companies) : null,
                    });
                })
            )
        );
        console.log('✅ Users seeded');

        // -------------------------
        // 3. JOB OFFERS
        // -------------------------
        const enterpriseUsers = users.filter(u => u.role === UserRole.ENTERPRISE);
        const jobs: JobOffer[] = [];

        for (const user of enterpriseUsers) {
            if (!user.company) continue;

            for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
                const job = jobRepo.create({
                    title: faker.person.jobTitle(),
                    location: faker.location.city(),
                    type: faker.helpers.arrayElement(Object.values(JobType)) as JobType,
                    experience: faker.helpers.arrayElement(Object.values(JobExperienceType)) as JobExperienceType,
                    salary: `${faker.number.int({ min: 300, max: 5000 })} USD`,
                    description: faker.lorem.paragraph(),
                    benefits: faker.lorem.paragraph(),
                    requirements: faker.helpers.arrayElements(['NestJS','React','Flutter','NodeJS','Laravel'], 3),
                    status: JobStatus.ACTIVE,
                    applicants: 0,
                    company: user.company
                });

                const savedJob = await jobRepo.save(job);
                jobs.push(savedJob);
            }
        }
        console.log('✅ JobOffers seeded');

        // -------------------------
        // 4. PORTFOLIOS
        // -------------------------
        await portfolioRepo.save(
            users.flatMap(user =>
                Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => portfolioRepo.create({
                    title: faker.person.jobTitle(),
                    description: faker.lorem.paragraph(),
                    skills: faker.helpers.arrayElements(['NestJS','React','Flutter','NodeJS','Laravel'], 3),
                    views: faker.number.int(500),
                    downloads: faker.number.int(100),
                    likes: faker.number.int(200),
                    createdDate: faker.date.past(),
                    user,
                }))
            )
        );
        console.log('✅ Portfolios seeded');

        // -------------------------
        // 5. CANDIDATURES
        // -------------------------
        const candidateUsers = users.filter(u => u.role === UserRole.USER);

        const candidatures = await candidatureRepo.save(
            candidateUsers.flatMap(user =>
                Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => {
                    const job = faker.helpers.arrayElement(jobs);
                    job.applicants++;
                    return candidatureRepo.create({
                        candidateName: user.name,
                        candidateEmail: user.email,
                        status: faker.helpers.arrayElement(Object.values(CandidatureStatus)),
                        score: faker.number.int({ min: 50, max: 100 }),
                        appliedDate: faker.date.recent(),
                        user,
                        jobOffer: job
                    });
                })
            )
        );
        await jobRepo.save(jobs);
        console.log('✅ Candidatures seeded');

        // -------------------------
        // 6. SCORING
        // -------------------------
        await scoringRepo.save(
            candidatures.map(c => scoringRepo.create({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                overallScore: c.score,
                criteria: {
                    experience: faker.number.int(100),
                    skills: faker.number.int(100),
                    education: faker.number.int(100)
                },
                analysisDate: faker.date.recent(),
                status: faker.helpers.arrayElement(Object.values(ScoringStatus))
            }))
        );
        console.log('✅ ScoringResults seeded');

        // -------------------------
        // 7. MATCHING
        // -------------------------
        await matchingRepo.save(
            candidatures.map(c => matchingRepo.create({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                company: c.jobOffer.company?.name,
                matchingScore: faker.number.int(100),
                status: faker.helpers.arrayElement(Object.values(MatchingStatus)),
                matchDate: faker.date.recent()
            }))
        );
        console.log('✅ MatchingResults seeded');

        // -------------------------
        // 8. INTERVIEWS
        // -------------------------
        await interviewRepo.save(
            candidatures.map(c => interviewRepo.create({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                duration: faker.number.int({ min: 15, max: 90 }),
                score: faker.number.int(100),
                status: faker.helpers.arrayElement(Object.values(InterviewStatus)),
                startTime: faker.date.recent(),
                feedback: faker.lorem.sentence()
            }))
        );
        console.log('✅ InterviewSessions seeded');

        // -------------------------
        // 9. CV ANALYSIS
        // -------------------------
        await cvRepo.save(
            users.map(u => cvRepo.create({
                fileName: `${u.name}_cv.pdf`,
                analysisScore: faker.number.int(100),
                recommendations: faker.helpers.arrayElements(['Improve skills','Add projects','Update experience'], 2),
                uploadDate: faker.date.recent(),
                status: faker.helpers.arrayElement(Object.values(CVStatus))
            }))
        );
        console.log('✅ CVAnalysis seeded');

        // -------------------------
        // 10. CALENDAR EVENTS
        // -------------------------
        await eventRepo.save(
            candidatures.map(c => {
                const start = faker.date.future();
                const end = faker.date.future({ refDate: start });
                return eventRepo.create({
                    title: `Interview - ${c.candidateName}`,
                    type: EventType.ENTRETIEN,
                    startTime: start,
                    endTime: end,
                    participants: [c.candidateEmail],
                    location: faker.location.city(),
                    status: EventStatus.CONFIRMED
                });
            })
        );
        console.log('✅ CalendarEvents seeded');
    }
}