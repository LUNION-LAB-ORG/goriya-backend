import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";

import { User } from "../users/user.entity";

@Entity()
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
}