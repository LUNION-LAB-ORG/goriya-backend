import { EventStatus, EventType } from "src/@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class CalendarEvent {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column({ type: "enum", enum: EventType })
    type: EventType;

    @Column({ type: "timestamp" })
    startTime: Date;

    @Column({ type: "timestamp" })
    endTime: Date;

    @Column("text", { array: true })
    participants: string[];

    @Column({ nullable: true })
    location: string;

    @Column({ type: "enum", enum: EventStatus })
    status: EventStatus;
}