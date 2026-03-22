import { ScoringStatus } from "../@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

@Entity('scoring_results')
export class ScoringResult {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'candidate_name' })
    candidateName: string;

    @Column({ name: 'candidate_email' })
    candidateEmail: string;

    @Column()
    position: string;

    @Column({ name: 'overall_score' })
    overallScore: number;

    @Column("jsonb")
    criteria: any;

    @Column({ type: "timestamp" })
    analysisDate: Date;

    @Column({ type: "enum", enum: ScoringStatus })
    status: ScoringStatus;

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;   
}