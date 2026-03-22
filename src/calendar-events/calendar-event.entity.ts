import { EventStatus, EventType } from "../@types/enums";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

@Entity('calendar_events')
export class CalendarEvent {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column({ type: "enum", enum: EventType })
    type: EventType;

    @Column({ type: "timestamp", name: 'start_time' })
    startTime: Date;

    @Column({ type: "timestamp", name: 'end_time' })
    endTime: Date;

    @Column("text", { array: true })
    participants: string[];

    @Column({ nullable: true })
    location: string;

    @Column({ type: "enum", enum: EventStatus })
    status: EventStatus;

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;          
}