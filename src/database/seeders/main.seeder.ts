import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

import {
    IVORIAN_CITIES,
    COMPANY_SECTORS,
    COMPANY_SIZES,
    JOB_TEMPLATES,
    generateCompanyNames,
    randomItem,
    randomFullName,
    emailFromName,
    randomIvorianPhone,
    formatSalary,
    companyLogoUrl,
    buildJobDescription,
    buildJobBenefits,
} from './data/ivorian.data';

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

        // Chaque entité vise ~500 enregistrements, reliés entre eux (companies -> users/jobs,
        // jobs + users -> candidatures, candidatures -> scoring/matching/interviews/events).
        const TARGET_COMPANIES = 500;
        const TARGET_USERS = 500;
        const TARGET_JOBS = 500;
        const TARGET_PORTFOLIOS = 500;
        const TARGET_CANDIDATURES = 500;

        // -------------------------
        // 1. COMPANIES
        // -------------------------
        const companies = await companyRepo.save(
            generateCompanyNames(TARGET_COMPANIES).map((name) => {
                const city = randomItem(IVORIAN_CITIES);
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return companyRepo.create({
                    name,
                    sector: randomItem(COMPANY_SECTORS),
                    logo: companyLogoUrl(name),
                    coverImage: faker.image.urlPicsumPhotos(),
                    about: `${name} est une entreprise ivoirienne reconnue dans son secteur, basée à ${city}.`,
                    creationDate: faker.date.past({ years: 15 }),
                    partnershipDate: faker.date.recent({ days: 180 }),
                    companySize: randomItem(COMPANY_SIZES),
                    website: `https://www.${slug}.ci`,
                    socialLinks: [
                        `https://www.facebook.com/${slug}`,
                        `https://www.linkedin.com/company/${slug}`,
                        `https://www.instagram.com/${slug}`,
                    ],
                    country: 'Côte d\'Ivoire',
                    headquarters: city,
                    location: city,
                    phone: randomIvorianPhone(),
                    email: `contact@${slug}.ci`,
                    status: faker.helpers.arrayElement(Object.values(CompanyStatus)),
                });
            }),
            { chunk: 50 }
        );
        console.log(`✅ Companies seeded (${companies.length})`);

        // -------------------------
        // 2. USERS
        // -------------------------
        const users = await userRepo.save(
            await Promise.all(
                Array.from({ length: TARGET_USERS }).map(async (_, i) => {
                    const isEnterprise = i % 3 === 0;
                    const name = randomFullName();

                    return userRepo.create({
                        name,
                        email: emailFromName(name, i),
                        password: await bcrypt.hash('password123', 10),
                        role: isEnterprise ? UserRole.ENTERPRISE : (i === 0 ? UserRole.ADMIN : UserRole.USER),
                        status: UserStatus.ACTIVE,
                        avatar: faker.image.avatar(),
                        company: isEnterprise ? faker.helpers.arrayElement(companies) : null,
                    });
                })
            ),
            { chunk: 50 }
        );
        console.log(`✅ Users seeded (${users.length})`);

        // -------------------------
        // 3. JOB OFFERS
        // -------------------------
        const JOBS_TARGET = TARGET_JOBS;
        const jobsPerCompany = Math.ceil(JOBS_TARGET / companies.length);

        const jobsToCreate: JobOffer[] = [];
        for (const company of companies) {
            const count = faker.number.int({ min: Math.max(1, jobsPerCompany - 5), max: jobsPerCompany + 5 });

            for (let i = 0; i < count && jobsToCreate.length < JOBS_TARGET; i++) {
                const template = randomItem(JOB_TEMPLATES);
                const location = randomItem(IVORIAN_CITIES);
                const experience = faker.helpers.arrayElement(Object.values(JobExperienceType)) as JobExperienceType;
                const publishDate = faker.date.recent({ days: 3 });
                const endDate = faker.date.soon({ days: 45, refDate: publishDate });

                jobsToCreate.push(jobRepo.create({
                    title: template.title,
                    location,
                    type: faker.helpers.arrayElement(Object.values(JobType)) as JobType,
                    experience,
                    salary: formatSalary(experience),
                    description: buildJobDescription(template.title, company.name, location, template.skills),
                    benefits: buildJobBenefits(),
                    requirements: template.skills,
                    status: JobStatus.ACTIVE,
                    applicants: 0,
                    publishDate,
                    endDate,
                    company,
                }));
            }
        }

        const jobs = await jobRepo.save(jobsToCreate, { chunk: 50 });
        console.log(`✅ JobOffers seeded (${jobs.length})`);

        // -------------------------
        // 4. PORTFOLIOS
        // -------------------------
        const portfolioOwners = users
            .flatMap(user => Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => user))
            .slice(0, TARGET_PORTFOLIOS);

        const portfolios = await portfolioRepo.save(
            portfolioOwners.map(user => {
                const template = randomItem(JOB_TEMPLATES);
                return portfolioRepo.create({
                    title: template.title,
                    description: `Portfolio professionnel présentant mes réalisations en ${template.skills.join(', ')}.`,
                    skills: template.skills,
                    views: faker.number.int(500),
                    downloads: faker.number.int(100),
                    likes: faker.number.int(200),
                    createdDate: faker.date.past(),
                    user,
                });
            }),
            { chunk: 50 }
        );
        console.log(`✅ Portfolios seeded (${portfolios.length})`);

        // -------------------------
        // 5. CANDIDATURES
        // -------------------------
        const candidateUsers = users.filter(u => u.role === UserRole.USER);

        const candidatureOwners = candidateUsers
            .flatMap(user => Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => user))
            .slice(0, TARGET_CANDIDATURES);

        const candidatures = await candidatureRepo.save(
            candidatureOwners.map(user => {
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
            }),
            { chunk: 50 }
        );
        await jobRepo.save(jobs, { chunk: 50 });
        console.log(`✅ Candidatures seeded (${candidatures.length})`);

        // -------------------------
        // 6. SCORING
        // -------------------------
        const scoringResults = await scoringRepo.save(
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
            })),
            { chunk: 50 }
        );
        console.log(`✅ ScoringResults seeded (${scoringResults.length})`);

        // -------------------------
        // 7. MATCHING
        // -------------------------
        const matchingResults = await matchingRepo.save(
            candidatures.map(c => matchingRepo.create({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                company: c.jobOffer.company?.name,
                matchingScore: faker.number.int(100),
                status: faker.helpers.arrayElement(Object.values(MatchingStatus)),
                matchDate: faker.date.recent()
            })),
            { chunk: 50 }
        );
        console.log(`✅ MatchingResults seeded (${matchingResults.length})`);

        // -------------------------
        // 8. INTERVIEWS
        // -------------------------
        const interviewSessions = await interviewRepo.save(
            candidatures.map(c => interviewRepo.create({
                candidateName: c.candidateName,
                candidateEmail: c.candidateEmail,
                position: c.jobOffer.title,
                duration: faker.number.int({ min: 15, max: 90 }),
                score: faker.number.int(100),
                status: faker.helpers.arrayElement(Object.values(InterviewStatus)),
                startTime: faker.date.recent(),
                feedback: randomItem([
                    'Bonne maîtrise technique, communication claire.',
                    'Profil motivé, à approfondir sur certains points techniques.',
                    'Excellente présentation, expérience solide.',
                    'Manque un peu de recul sur la gestion de projet.',
                ])
            })),
            { chunk: 50 }
        );
        console.log(`✅ InterviewSessions seeded (${interviewSessions.length})`);

        // -------------------------
        // 9. CV ANALYSIS
        // -------------------------
        const cvAnalyses = await cvRepo.save(
            users.map(u => cvRepo.create({
                fileName: `${u.name}_cv.pdf`,
                analysisScore: faker.number.int(100),
                recommendations: faker.helpers.arrayElements(['Renforcer les compétences techniques', 'Ajouter des projets concrets', 'Mettre à jour les expériences professionnelles', 'Détailler les réalisations chiffrées'], 2),
                uploadDate: faker.date.recent(),
                status: faker.helpers.arrayElement(Object.values(CVStatus))
            })),
            { chunk: 50 }
        );
        console.log(`✅ CVAnalysis seeded (${cvAnalyses.length})`);

        // -------------------------
        // 10. CALENDAR EVENTS
        // -------------------------
        const calendarEvents = await eventRepo.save(
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
            }),
            { chunk: 50 }
        );
        console.log(`✅ CalendarEvents seeded (${calendarEvents.length})`);
    }
}