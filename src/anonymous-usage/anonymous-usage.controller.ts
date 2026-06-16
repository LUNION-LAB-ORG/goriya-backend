import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AnonymousUsageService } from './anonymous-usage.service'
import { Public } from '../auth/public.decorator'

@Public()
@Controller('anonymous-usage')
export class AnonymousUsageController {
    constructor(private readonly service: AnonymousUsageService) {}

    /** Atomically checks and consumes one free use. Call this right before running the feature. */
    @Post('consume')
    consume(@Body() body: { deviceId: string; featureKey: string }) {
        return this.service.checkAndConsume(body.deviceId, body.featureKey)
    }

    /** Read-only status — used to display remaining free uses to the user. */
    @Get('status')
    status(
        @Query('deviceId') deviceId: string,
        @Query('featureKey') featureKey: string,
    ) {
        return this.service.getStatus(deviceId, featureKey)
    }
}
