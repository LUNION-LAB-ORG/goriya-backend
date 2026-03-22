import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    ManyToOne
} from "typeorm";

import { Portfolio } from "../portfolios/portfolio.entity";
import { Candidature } from "../candidatures/candidature.entity";
import { UserRole, UserStatus } from "src/@types/enums";
import { Company } from "src/companies/company.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    status: UserStatus;

    @Column({ nullable: true })
    avatar: string;

    @CreateDateColumn()
    registrationDate: Date;

    // 🔥 AJOUT ICI
    @ManyToOne(() => Company, company => company.users, { nullable: true })
    company: Company;

    @OneToMany(() => Portfolio, portfolio => portfolio.user)
    portfolios: Portfolio[];

    @OneToMany(() => Candidature, candidature => candidature.user)
    candidatures: Candidature[];
}