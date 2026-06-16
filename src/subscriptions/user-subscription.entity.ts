import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../users/user.entity'
import { SubscriptionPlan } from './subscription-plan.entity'
import { SubscriptionStatus } from '../@types/enums'

@Entity('user_subscriptions')
export class UserSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ name: 'plan_id', type: 'uuid', nullable: true })
    planId: string | null

    @ManyToOne(() => SubscriptionPlan, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'plan_id' })
    plan: SubscriptionPlan | null

    @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
    status: SubscriptionStatus

    @Column({ type: 'timestamp', name: 'start_date' })
    startDate: Date

    @Column({ type: 'timestamp', name: 'end_date', nullable: true })
    endDate: Date | null

    @Column({ name: 'auto_renew', default: false })
    autoRenew: boolean

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
