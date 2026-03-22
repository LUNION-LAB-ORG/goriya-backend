import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";

import { User } from "../users/user.entity";
import { JobOffer } from "../job-offers/job-offer.entity";
import { CandidatureStatus } from "src/@types/enums";

@Entity()
export class Candidature {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    candidateName: string;

    @Column()
    candidateEmail: string;

    @Column({
        type: "enum",
        enum: CandidatureStatus,
        default: CandidatureStatus.EN_ATTENTE
    })
    status: CandidatureStatus;

    @Column({ default: 0 })
    score: number;

    @Column({ type: "timestamp" })
    appliedDate: Date;

    @ManyToOne(() => User, user => user.candidatures)
    user: User;

    @ManyToOne(() => JobOffer, offer => offer.candidatures)
    jobOffer: JobOffer;
}