import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { BillingPeriod, SubscriptionUserType } from '../@types/enums'

@Entity('subscription_plans')
export class SubscriptionPlan {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    price: number

    @Column({ type: 'enum', enum: BillingPeriod, name: 'billing_period' })
    billingPeriod: BillingPeriod

    @Column({ type: 'enum', enum: SubscriptionUserType, name: 'user_type' })
    userType: SubscriptionUserType

    @Column({ type: 'jsonb', default: '[]' })
    features: string[]

    @Column({ name: 'is_active', default: true })
    isActive: boolean

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
