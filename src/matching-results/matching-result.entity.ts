import { MatchingStatus } from "../@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

@Entity('matching_results')
export class MatchingResult {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'candidate_name' })
    candidateName: string;

    @Column({ name: 'candidate_email' })
    candidateEmail: string;

    @Column()
    position: string;

    @Column()
    company: string;

    @Column({ name: 'matching_score' })
    matchingScore: number;

    @Column({ type: "enum", enum: MatchingStatus, default: MatchingStatus.NOUVEAU })
    status: MatchingStatus;

    @Column({ type: "timestamp", name: 'match_date' })
    matchDate: Date;

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;   
}