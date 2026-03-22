import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

import { User } from "../users/user.entity";
import { JobOffer } from "../job-offers/job-offer.entity";
import { CandidatureStatus } from "../@types/enums";

@Entity('candidatures')
export class Candidature {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'candidate_name' })
    candidateName: string;

    @Column({ name: 'candidate_email' })
    candidateEmail: string;

    @Column({
        type: "enum",
        enum: CandidatureStatus,
        default: CandidatureStatus.EN_ATTENTE
    })
    status: CandidatureStatus;

    @Column({ default: 0 })
    score: number;

    @Column({ type: "timestamp", name: 'applied_date' })
    appliedDate: Date;

    @ManyToOne(() => User, user => user.candidatures)
    user: User;

    @ManyToOne(() => JobOffer, offer => offer.candidatures)
    jobOffer: JobOffer;

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;   
}