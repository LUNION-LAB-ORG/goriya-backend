import { InterviewStatus } from "../@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

@Entity('interview_sessions')
export class InterviewSession {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'candidate_name' })
    candidateName: string;

    @Column({ name: 'candidate_email' })
    candidateEmail: string;

    @Column()
    position: string;

    @Column()
    duration: number;

    @Column()
    score: number;

    @Column({ type: "enum", enum: InterviewStatus })
    status: InterviewStatus;

    @Column({ type: "timestamp", name: 'start_time' })
    startTime: Date;

    @Column({ nullable: true })
    feedback: string;

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;     
}