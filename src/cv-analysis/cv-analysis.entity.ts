import { CVStatus } from "src/@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";


@Entity()
export class CVAnalysis {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    fileName: string;

    @Column()
    analysisScore: number;

    @Column("text", { array: true })
    recommendations: string[];

    @Column({ type: "timestamp" })
    uploadDate: Date;

    @Column({ type: "enum", enum: CVStatus })
    status: CVStatus;
}