import { Injectable, InternalServerErrorException, BadGatewayException } from '@nestjs/common'

export interface WaveCheckoutSession {
    id: string
    wave_launch_url: string
    transaction_id: string | null
    checkout_status: 'open' | 'complete' | 'expired'
    payment_status: 'processing' | 'cancelled' | 'succeeded' | null
    amount: string
    currency: string
    client_reference: string | null
    when_created: string
    when_expires: string
    when_completed: string | null
}

@Injectable()
export class WaveService {
    private readonly baseUrl = 'https://api.wave.com'

    private get apiKey(): string {
        const key = process.env.WAVE_API_KEY
        if (!key) throw new InternalServerErrorException('WAVE_API_KEY non configurée')
        return key
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...(options.headers ?? {}),
            },
        })

        const body = await res.json().catch(() => ({}))

        if (!res.ok) {
            throw new BadGatewayException(
                (body as any)?.message ?? `Wave API error ${res.status}`,
            )
        }

        return body as T
    }

    async createCheckoutSession(params: {
        amount: string
        currency: string
        successUrl: string
        errorUrl: string
        clientReference?: string
    }): Promise<WaveCheckoutSession> {
        const body: Record<string, string> = {
            amount: params.amount,
            currency: params.currency,
            success_url: params.successUrl,
            error_url: params.errorUrl,
        }
        if (params.clientReference) body.client_reference = params.clientReference

        return this.request<WaveCheckoutSession>('/v1/checkout/sessions', {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    async getCheckoutSession(sessionId: string): Promise<WaveCheckoutSession> {
        return this.request<WaveCheckoutSession>(`/v1/checkout/sessions/${sessionId}`)
    }
}
