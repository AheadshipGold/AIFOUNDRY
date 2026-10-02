import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubscriptionsService, PlanFeatureDefinition, SubscriptionRecord } from './subscriptions.service';
import { PlanTier, BillingInterval, BillingSource } from '@prisma/client';

@Controller('v1/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans(): PlanFeatureDefinition[] {
    return this.subscriptionsService.getAvailablePlans();
  }

  @Get('shop/:shopId')
  async getShopSubscription(@Param('shopId') shopId: string): Promise<SubscriptionRecord> {
    return this.subscriptionsService.getShopSubscription(shopId);
  }

  @Post('upgrade')
  async upgradePlan(
    @Body()
    body: {
      shopId: string;
      planTier: PlanTier;
      billingInterval?: BillingInterval;
      billingSource?: BillingSource;
      paymentReference?: string;
    }
  ): Promise<SubscriptionRecord> {
    return this.subscriptionsService.upgradePlan(body);
  }

  @Get('all')
  async listAll(): Promise<SubscriptionRecord[]> {
    return this.subscriptionsService.listAll();
  }
}
