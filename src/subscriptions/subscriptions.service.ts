import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubscriptionPlan } from './subscription-plan.entity'
import { UserSubscription } from './user-subscription.entity'
import { BillingPeriod, SubscriptionStatus, SubscriptionUserType } from '../@types/enums'
import { WaveService } from '../wave/wave.service'

@Injectable()
export class SubscriptionsService implements OnModuleInit {
    constructor(
        @InjectRepository(SubscriptionPlan)
        private readonly planRepo: Repository<SubscriptionPlan>,
        @InjectRepository(UserSubscription)
        private readonly subRepo: Repository<UserSubscription>,
        private readonly waveService: WaveService,
    ) {}

    async onModuleInit() {
        await this.seedPlans()
    }

    private async seedPlans() {
        const count = await this.planRepo.count()
        if (count > 0) return

        const plans = [
            {
                name: 'Grouilleur',
                price: 0,
                billingPeriod: BillingPeriod.MONTHLY,
                userType: SubscriptionUserType.USER,
                features: ["Recherche d'emploi illimitée", '3 analyses CV par mois', 'Support par email', 'Valable 2 semaines'],
                isActive: true,
            },
            {
                name: 'Standard',
                price: 1999,
                billingPeriod: BillingPeriod.MONTHLY,
                userType: SubscriptionUserType.USER,
                features: ['20 analyses CV par mois', 'Suggestions avancées IA', 'Multi-formats export', 'Personnalisation sectorielle', 'Support prioritaire'],
                isActive: true,
            },
            {
                name: 'Premium',
                price: 4999,
                billingPeriod: BillingPeriod.MONTHLY,
                userType: SubscriptionUserType.USER,
                features: ['Analyses CV illimitées', 'Suggestions IA avancées', "Simulation d'entretien IA", 'Support prioritaire', 'Export multi-formats', 'Personnalisation sectorielle'],
                isActive: true,
            },
            {
                name: 'Business',
                price: 35500,
                billingPeriod: BillingPeriod.MONTHLY,
                userType: SubscriptionUserType.ENTREPRISE,
                features: ['20 analyses CV par mois', 'Suggestions avancées IA', 'Multi-formats export', 'Personnalisation sectorielle', 'Support prioritaire'],
                isActive: true,
            },
            {
                name: 'Business+',
                price: 351900,
                billingPeriod: BillingPeriod.ANNUAL,
                userType: SubscriptionUserType.ENTREPRISE,
                features: ['20 analyses CV par mois', 'Suggestions avancées IA', 'Multi-formats export', 'Personnalisation sectorielle', 'Support prioritaire'],
                isActive: true,
            },
        ]

        for (const plan of plans) {
            await this.planRepo.save(this.planRepo.create(plan))
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PLANS
    // ─────────────────────────────────────────────────────────────────────────

    async getPlans(userType?: SubscriptionUserType): Promise<SubscriptionPlan[]> {
        const where: any = { isActive: true }
        if (userType) where.userType = userType
        return this.planRepo.find({ where, order: { price: 'ASC' } })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUBSCRIBE
    // ─────────────────────────────────────────────────────────────────────────

    async subscribe(userId: string, planId: string): Promise<UserSubscription> {
        const plan = await this.planRepo.findOne({ where: { id: planId } })
        if (!plan) throw new NotFoundException('Plan non trouvé')

        // Cancel any existing active subscription
        await this.subRepo.update(
            { userId, status: SubscriptionStatus.ACTIVE },
            { status: SubscriptionStatus.CANCELLED },
        )

        const startDate = new Date()
        const endDate = new Date(startDate)
        if (plan.billingPeriod === BillingPeriod.ANNUAL) {
            endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
            endDate.setMonth(endDate.getMonth() + 1)
        }

        const sub = this.subRepo.create({
            userId,
            planId,
            status: SubscriptionStatus.ACTIVE,
            startDate,
            endDate,
            autoRenew: false,
        })
        return this.subRepo.save(sub)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MY SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────────────────

    async getMySubscription(userId: string): Promise<UserSubscription | null> {
        return this.subRepo.findOne({
            where: { userId, status: SubscriptionStatus.ACTIVE },
            relations: ['plan'],
            order: { createdAt: 'DESC' },
        })
    }

    async cancelSubscription(userId: string): Promise<{ message: string }> {
        await this.subRepo.update(
            { userId, status: SubscriptionStatus.ACTIVE },
            { status: SubscriptionStatus.CANCELLED },
        )
        return { message: 'Abonnement annulé avec succès' }
    }

    async hasActiveSubscription(userId: string): Promise<boolean> {
        const sub = await this.subRepo.findOne({
            where: { userId, status: SubscriptionStatus.ACTIVE },
        })
        return !!sub
    }

    async getSubscriptionInfo(userId: string): Promise<{
        hasSubscription: boolean
        planName: string | null
        status: string | null
    }> {
        const sub = await this.subRepo.findOne({
            where: { userId, status: SubscriptionStatus.ACTIVE },
            relations: ['plan'],
            order: { createdAt: 'DESC' },
        })
        return {
            hasSubscription: !!sub,
            planName: sub?.plan?.name ?? null,
            status: sub?.status ?? null,
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    async getAllSubscriptions(page = 1, limit = 20) {
        const [data, total] = await this.subRepo.findAndCount({
            relations: ['plan', 'user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        })
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    }

    async getAdminStats() {
        const all = await this.subRepo.find({ relations: ['plan'] })
        const active = all.filter(s => s.status === SubscriptionStatus.ACTIVE)
        const expired = all.filter(s => s.status === SubscriptionStatus.EXPIRED)
        const cancelled = all.filter(s => s.status === SubscriptionStatus.CANCELLED)
        const revenue = active.reduce((sum, s) => sum + Number(s.plan?.price ?? 0), 0)
        return {
            total: all.length,
            active: active.length,
            expired: expired.length,
            cancelled: cancelled.length,
            revenue,
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WAVE CHECKOUT
    // ─────────────────────────────────────────────────────────────────────────

    async createCheckout(userId: string, planId: string, successUrl: string, errorUrl: string) {
        const plan = await this.planRepo.findOne({ where: { id: planId } })
        if (!plan) throw new NotFoundException('Plan non trouvé')
        if (Number(plan.price) === 0) throw new BadRequestException('Ce plan est gratuit, utilisez /subscribe directement')

        // XOF has no decimals — amount must be a whole-number string
        const amount = Math.round(Number(plan.price)).toString()

        const clientReference = `${userId}_${planId}_${Date.now()}`

        // Append query params so the success page can verify
        const fullSuccess = `${successUrl}?ref=${clientReference}&userId=${userId}&planId=${planId}`
        const fullError = `${errorUrl}?planId=${planId}`

        const session = await this.waveService.createCheckoutSession({
            amount,
            currency: 'XOF',
            successUrl: fullSuccess,
            errorUrl: fullError,
            clientReference,
        })

        return {
            waveUrl: session.wave_launch_url,
            sessionId: session.id,
            clientReference,
            expiresAt: session.when_expires,
        }
    }

    async verifyAndActivate(sessionId: string, userId: string, planId: string): Promise<UserSubscription> {
        const session = await this.waveService.getCheckoutSession(sessionId)

        if (session.payment_status !== 'succeeded') {
            throw new BadRequestException(`Paiement non confirmé (statut: ${session.payment_status ?? 'inconnu'})`)
        }

        // Idempotency: if already activated for this session, return existing
        const existing = await this.subRepo.findOne({
            where: { userId, planId, status: SubscriptionStatus.ACTIVE },
            relations: ['plan'],
        })
        if (existing) return existing

        return this.subscribe(userId, planId)
    }
}
