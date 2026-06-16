import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('anonymous_usages')
@Index(['deviceId', 'featureKey'], { unique: true })
export class AnonymousUsage {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'device_id' })
    deviceId: string

    @Column({ name: 'feature_key' })
    featureKey: string

    @Column({ type: 'int', default: 0 })
    count: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}
