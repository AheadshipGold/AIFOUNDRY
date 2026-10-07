import { Controller, Get, Post, Body, Param, Headers, Req } from '@nestjs/common';
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
  async getShopSub(@Param('shopId') shopId: string): Promise<SubscriptionRecord> {
    return this.subscriptionsService.getShopSubscription(shopId);
  }

  @Post('upgrade')
  async upgradePlan(
    @Body()
    dto: {
      shopId: string;
      planTier: PlanTier;
      billingInterval?: BillingInterval;
      billingSource?: BillingSource;
      paymentReference?: string;
    }
  ): Promise<SubscriptionRecord> {
    return this.subscriptionsService.upgradePlan(dto);
  }

  @Post('moneroo/initialize')
  async initializeMoneroo(
    @Body()
    dto: {
      shopId: string;
      planTier: PlanTier;
      billingInterval?: BillingInterval;
      customerEmail: string;
      customerName?: string;
      customerPhone?: string;
      returnUrl?: string;
    }
  ) {
    return this.subscriptionsService.initializeMonerooCheckout(dto);
  }

  @Post('moneroo/webhook')
  async handleMonerooWebhook(
    @Headers() headers: Record<string, string>,
    @Body() payload: Record<string, any>,
    @Req() req: any
  ) {
    const rawBody = typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(payload);
    return this.subscriptionsService.processMonerooWebhook(headers, rawBody, payload);
  }

  @Get('moneroo/verify/:paymentId')
  async verifyPayment(@Param('paymentId') paymentId: string) {
    const { monerooAdapter } = await import('./moneroo.adapter');
    return monerooAdapter.verifyPaymentWithProvider(paymentId);
  }

  @Get('all')
  async listAll(): Promise<SubscriptionRecord[]> {
    return this.subscriptionsService.listAll();
  }
}
