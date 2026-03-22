import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

import { User } from "../users/user.entity";

@Entity('portfolios')
export class Portfolio {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column("text")
    description: string;

    @Column("text", { array: true })
    skills: string[];

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    downloads: number;

    @Column({ default: 0 })
    likes: number;

    @Column({ type: "timestamp" })
    createdDate: Date;

    @ManyToOne(() => User, user => user.portfolios)
    user: User;

    // Horodatage attributes
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;   
}