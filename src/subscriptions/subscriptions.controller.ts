import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { SubscriptionUserType } from '../@types/enums'
import { Public } from '../auth/public.decorator'

@Public()
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    /*
    |----------------------------------------------------------------------
    | PLANS
    |----------------------------------------------------------------------
    */
    @Get('plans')
    getPlans(@Query('userType') userType?: SubscriptionUserType) {
        return this.subscriptionsService.getPlans(userType)
    }

    /*
    |----------------------------------------------------------------------
    | SUBSCRIBE
    |----------------------------------------------------------------------
    */
    @Post('subscribe')
    subscribe(@Body() body: { userId: string; planId: string }) {
        return this.subscriptionsService.subscribe(body.userId, body.planId)
    }

    /*
    |----------------------------------------------------------------------
    | MY SUBSCRIPTION
    |----------------------------------------------------------------------
    */
    @Get('me/:userId')
    getMySubscription(@Param('userId') userId: string) {
        return this.subscriptionsService.getMySubscription(userId)
    }

    @Delete('me/:userId')
    cancelSubscription(@Param('userId') userId: string) {
        return this.subscriptionsService.cancelSubscription(userId)
    }

    /*
    |----------------------------------------------------------------------
    | SUBSCRIPTION CHECK (for feature gating)
    |----------------------------------------------------------------------
    */
    @Get('check/:userId')
    checkSubscription(@Param('userId') userId: string) {
        return this.subscriptionsService.getSubscriptionInfo(userId)
    }

    /*
    |----------------------------------------------------------------------
    | WAVE CHECKOUT
    |----------------------------------------------------------------------
    */
    @Post('checkout')
    createCheckout(
        @Body() body: { userId: string; planId: string; successUrl: string; errorUrl: string },
    ) {
        return this.subscriptionsService.createCheckout(
            body.userId,
            body.planId,
            body.successUrl,
            body.errorUrl,
        )
    }

    @Get('checkout/verify/:sessionId')
    verifyAndActivate(
        @Param('sessionId') sessionId: string,
        @Query('userId') userId: string,
        @Query('planId') planId: string,
    ) {
        return this.subscriptionsService.verifyAndActivate(sessionId, userId, planId)
    }

    /*
    |----------------------------------------------------------------------
    | ADMIN
    |----------------------------------------------------------------------
    */
    @Get('admin/stats')
    getAdminStats() {
        return this.subscriptionsService.getAdminStats()
    }

    @Get('admin/all')
    getAllSubscriptions(
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    ) {
        return this.subscriptionsService.getAllSubscriptions(page, limit)
    }
}
