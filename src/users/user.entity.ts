import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    ManyToOne,
    UpdateDateColumn
} from "typeorm";
import { Exclude } from 'class-transformer';
import { Portfolio } from "../portfolios/portfolio.entity";
import { Candidature } from "../candidatures/candidature.entity";
import { UserRole, UserStatus } from "../@types/enums";
import { Company } from "../companies/company.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
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

    @Column({ name: 'registration_date' })
    registrationDate: Date;

    // 🔥 AJOUT ICI
    @ManyToOne(() => Company, company => company.users, { nullable: true })
    company?: Company | null;

    @OneToMany(() => Portfolio, portfolio => portfolio.user)
    portfolios: Portfolio[];

    @OneToMany(() => Candidature, candidature => candidature.user)
    candidatures: Candidature[];

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;   
}