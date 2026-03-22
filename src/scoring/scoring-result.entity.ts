import { ScoringStatus } from "src/@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class ScoringResult {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    candidateName: string;

    @Column()
    candidateEmail: string;

    @Column()
    position: string;

    @Column()
    overallScore: number;

    @Column("jsonb")
    criteria: any;

    @Column({ type: "timestamp" })
    analysisDate: Date;

    @Column({ type: "enum", enum: ScoringStatus })
    status: ScoringStatus;
}