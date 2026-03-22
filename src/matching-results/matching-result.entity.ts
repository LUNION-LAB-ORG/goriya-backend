import { MatchingStatus } from "src/@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class MatchingResult {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    candidateName: string;

    @Column()
    candidateEmail: string;

    @Column()
    position: string;

    @Column()
    company: string;

    @Column()
    matchingScore: number;

    @Column({ type: "enum", enum: MatchingStatus, default: MatchingStatus.NOUVEAU })
    status: MatchingStatus;

    @Column({ type: "timestamp" })
    matchDate: Date;
}