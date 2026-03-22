import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany
} from "typeorm";

import { Company } from "../companies/company.entity";
import { Candidature } from "../candidatures/candidature.entity";
import { JobExperienceType, JobStatus, JobType } from "src/@types/enums";

@Entity()
export class JobOffer {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column()
    location: string;

    @Column({ type: "enum", enum: JobType })
    type: JobType;

    @Column({ type: "enum", enum: JobType })
    experience: JobExperienceType;

    @Column()
    salary: string;

    @Column("text")
    description: string;

    @Column("text")
    benefits: string;

    @Column("text", { array: true })
    requirements: string[];

    @Column({ type: "enum", enum: JobStatus, default: JobStatus.ACTIVE })
    status: JobStatus;

    @Column({ default: 0 })
    applicants: number;

    @ManyToOne(() => Company, company => company.jobOffers)
    company: Company;

    @OneToMany(() => Candidature, candidature => candidature.jobOffer)
    candidatures: Candidature[];
}