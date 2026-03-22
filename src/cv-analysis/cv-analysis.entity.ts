import { CVStatus } from "../@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";


@Entity('cv_analysis')
export class CVAnalysis {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'filename' })
    fileName: string;

    @Column({ name: 'analysis_score' })
    analysisScore: number;

    @Column("text", { array: true })
    recommendations: string[];

    @Column({ type: "timestamp", name: 'upload_date' })
    uploadDate: Date;

    @Column({ type: "enum", enum: CVStatus })
    status: CVStatus;

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;       
}