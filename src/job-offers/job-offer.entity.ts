import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

import { Company } from "../companies/company.entity";
import { Candidature } from "../candidatures/candidature.entity";
import { JobExperienceType, JobStatus, JobType } from "../@types/enums";

@Entity('job_offers')
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

    @Column({ name: 'publish_date', type: 'date' })
    publishDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({ default: 0 })
    applicants: number;

    @ManyToOne(() => Company, company => company.jobOffers, { nullable: true })
    company?: Company;

    @OneToMany(() => Candidature, candidature => candidature.jobOffer)
    candidatures: Candidature[];

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;     
}