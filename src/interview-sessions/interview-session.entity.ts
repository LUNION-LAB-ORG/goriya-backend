import { InterviewStatus } from "src/@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class InterviewSession {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    candidateName: string;

    @Column()
    candidateEmail: string;

    @Column()
    position: string;

    @Column()
    duration: number;

    @Column()
    score: number;

    @Column({ type: "enum", enum: InterviewStatus })
    status: InterviewStatus;

    @Column({ type: "timestamp" })
    startTime: Date;

    @Column({ nullable: true })
    feedback: string;
}