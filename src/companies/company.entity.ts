import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne
} from "typeorm";

import { JobOffer } from "../job-offers/job-offer.entity";
import { CompanyStatus } from "src/@types/enums";
import { User } from "src/users/user.entity";

@Entity()
export class Company {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    sector: string;

    @Column({ nullable: true })
    logo: string;

    @Column({ type: "enum", enum: CompanyStatus, default: CompanyStatus.ACTIVE })
    status: CompanyStatus;

    @Column({ type: "date" })
    partnershipDate: Date;

    @OneToMany(() => JobOffer, offer => offer.company)
    jobOffers: JobOffer[];

    // 🔥 AJOUT ICI
    @OneToMany(() => User, user => user.company)
    users: User[];
}