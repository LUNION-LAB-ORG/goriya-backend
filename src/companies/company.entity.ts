import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

import { JobOffer } from "../job-offers/job-offer.entity";
import { CompanyStatus } from "../@types/enums";
import { User } from "../users/user.entity";

@Entity('companies')
export class Company {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    sector: string;

    @Column({ nullable: true })
    logo: string;

    @Column({ name: 'cover_image', nullable: true })
    coverImage: string;

    @Column({ type: "text", nullable: true })
    about: string;

    @Column({ nullable: true })
    website: string;

    @Column({ name: 'creation_date', type: 'date', nullable: true })
    creationDate: Date;

    @Column({ name: 'partnership_date', type: 'date' })
    partnershipDate: Date;

    @Column({ name: 'company_size', nullable: true })
    companySize: string;

    @Column({ name: 'social_links', type: 'simple-array', nullable: true })
    socialLinks: string[];

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    headquarters: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: "enum", enum: CompanyStatus, default: CompanyStatus.ACTIVE })
    status: CompanyStatus;

    @OneToMany(() => JobOffer, offer => offer.company)
    jobOffers: JobOffer[];

    @OneToMany(() => User, user => user.company)
    users: User[];

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;   
}