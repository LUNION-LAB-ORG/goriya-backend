import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AnonymousUsage } from './anonymous-usage.entity'

const FREE_LIMITS: Record<string, number> = {
    cv_analysis: 3,
}

export interface UsageResult {
    allowed: boolean
    used: number
    remaining: number
    limit: number
}

@Injectable()
export class AnonymousUsageService {
    constructor(
        @InjectRepository(AnonymousUsage)
        private readonly repo: Repository<AnonymousUsage>,
    ) {}

    async checkAndConsume(deviceId: string, featureKey: string): Promise<UsageResult> {
        const limit = FREE_LIMITS[featureKey] ?? 3

        let record = await this.repo.findOne({ where: { deviceId, featureKey } })

        if (!record) {
            record = this.repo.create({ deviceId, featureKey, count: 0 })
        }

        if (record.count >= limit) {
            return { allowed: false, used: record.count, remaining: 0, limit }
        }

        record.count += 1
        await this.repo.save(record)

        return {
            allowed: true,
            used: record.count,
            remaining: limit - record.count,
            limit,
        }
    }

    async getStatus(deviceId: string, featureKey: string): Promise<UsageResult> {
        const limit = FREE_LIMITS[featureKey] ?? 3
        const record = await this.repo.findOne({ where: { deviceId, featureKey } })
        const used = record?.count ?? 0
        return {
            allowed: used < limit,
            used,
            remaining: Math.max(0, limit - used),
            limit,
        }
    }
}
