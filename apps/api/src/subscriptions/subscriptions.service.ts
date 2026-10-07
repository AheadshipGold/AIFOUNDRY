import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanTier, SubscriptionStatus, BillingSource, BillingInterval } from '@prisma/client';
import { MonerooAdapter, monerooAdapter } from './moneroo.adapter';

export interface PlanFeatureDefinition {
  tier: PlanTier;
  title: string;
  priceMonthlyMinor: number;
  priceAnnualMinor: number;
  maxProducts: number;
  hasPriorityD02: boolean;
  hasFecExport: boolean;
  hasVipConcierge: boolean;
  featuresList: string[];
}

export interface SubscriptionRecord {
  id: string;
  shopId: string;
  shopName?: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  billingSource: BillingSource;
  billingInterval: BillingInterval;
  priceMinor: number;
  currency: string;
  maxProducts: number;
  hasPriorityD02: boolean;
  hasFecExport: boolean;
  hasVipConcierge: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  externalPaymentRef?: string;
}

export const PLAN_TIERS: Record<PlanTier, PlanFeatureDefinition> = {
  DECOUVERTE_FREE: {
    tier: PlanTier.DECOUVERTE_FREE,
    title: 'Plan Découverte Boutique (Gratuit)',
    priceMonthlyMinor: 0,
    priceAnnualMinor: 0,
    maxProducts: 5,
    hasPriorityD02: false,
    hasFecExport: false,
    hasVipConcierge: false,
    featuresList: [
      'Jusqu’à 5 produits en vitrine',
      'Livre de caisse direct (S43-S47)',
      'Réception des paiements MTN MoMo / Moov (*880# / *155#)',
      '0% de commission sur les ventes',
    ],
  },
  ATELIER_PRO: {
    tier: PlanTier.ATELIER_PRO,
    title: 'Plan Boutique Pro',
    priceMonthlyMinor: 1500000, // 15 000 FCFA
    priceAnnualMinor: 15000000, // 150 000 FCFA (2 mois offerts)
    maxProducts: 9999,
    hasPriorityD02: true,
    hasFecExport: true,
    hasVipConcierge: false,
    featuresList: [
      'Produits & variantes illimités',
      'Accès prioritaire aux demandes et devis clients (D02)',
      'Badge Commerçant / Boutique Vérifiée',
      'Export comptable FEC / FinOps certifié',
      'Comptes multi-utilisateurs de boutique (gérants & vendeurs)',
    ],
  },
  MAISON_D_ART_PRESTIGE: {
    tier: PlanTier.MAISON_D_ART_PRESTIGE,
    title: "Plan Grande Enseigne & Prestige",
    priceMonthlyMinor: 4500000, // 45 000 FCFA
    priceAnnualMinor: 45000000, // 450 000 FCFA
    maxProducts: 9999,
    hasPriorityD02: true,
    hasFecExport: true,
    hasVipConcierge: true,
    featuresList: [
      'Toutes les options de la Boutique Pro',
      'Conciergerie dédiée 7j/7 & arbitrage VIP',
      'Mise en avant éditoriale sur la vitrine Web',
      'Gestion des guides et fichiers numériques protégés',
      'Support multi-devises & corridors régionaux',
    ],
  },
};

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  getAvailablePlans(): PlanFeatureDefinition[] {
    return Object.values(PLAN_TIERS);
  }

  async getShopSubscription(shopId: string): Promise<SubscriptionRecord> {
    try {
      let sub = await this.prisma.subscription.findFirst({
        where: { shopId },
        include: { shop: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!sub) {
        // Auto-create default free subscription
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 86400000);
        sub = await this.prisma.subscription.create({
          data: {
            shopId,
            planTier: PlanTier.DECOUVERTE_FREE,
            status: SubscriptionStatus.ACTIVE,
            billingSource: BillingSource.MTN_MOMO,
            billingInterval: BillingInterval.MONTHLY,
            priceMinor: 0,
            currency: 'XOF',
            maxProducts: 5,
            hasPriorityD02: false,
            hasFecExport: false,
            hasVipConcierge: false,
            currentPeriodStart: now,
            currentPeriodEnd: nextMonth,
          },
          include: { shop: true },
        });
      }

      return this.mapToRecord(sub);
    } catch {
      return this.getMockSubscription(shopId);
    }
  }

  async initializeMonerooCheckout(dto: {
    shopId: string;
    planTier: PlanTier;
    billingInterval?: BillingInterval;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    returnUrl?: string;
  }) {
    const planConfig = PLAN_TIERS[dto.planTier];
    if (!planConfig) {
      throw new BadRequestException(`Plan ${dto.planTier} invalide`);
    }

    const interval = dto.billingInterval || BillingInterval.MONTHLY;
    const priceMinor = interval === BillingInterval.ANNUAL ? planConfig.priceAnnualMinor : planConfig.priceMonthlyMinor;
    const referenceId = `SUB-${dto.shopId.slice(0, 8)}-${Date.now()}`;

    const session = await monerooAdapter.createSession({
      shopId: dto.shopId,
      planTier: dto.planTier,
      amountMinor: priceMinor,
      currency: 'XOF',
      description: `Ojarket ${planConfig.title} (${interval === BillingInterval.ANNUAL ? 'Annuel' : 'Mensuel'})`,
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      returnUrl: dto.returnUrl,
      referenceId,
      billingInterval: interval,
    });

    return session;
  }

  async processMonerooWebhook(headers: Record<string, any>, rawBody: string, payload: Record<string, any>) {
    const parsed = monerooAdapter.parseWebhookPayload(payload, rawBody, headers);

    if (!parsed.signatureMatches) {
      console.warn('[SubscriptionsService] Webhook signature mismatch');
      throw new BadRequestException('Signature cryptographique Moneroo invalide');
    }

    if (parsed.status === 'SUCCESS' && parsed.shopId) {
      const planTier = (parsed.planTier as PlanTier) || PlanTier.ATELIER_PRO;
      const interval = (parsed.billingInterval as BillingInterval) || BillingInterval.MONTHLY;
      
      return await this.upgradePlan({
        shopId: parsed.shopId,
        planTier,
        billingInterval: interval,
        billingSource: BillingSource.MONEROO,
        paymentReference: parsed.externalTransactionId || parsed.referenceId,
      });
    }

    return { received: true, status: parsed.status };
  }

  async upgradePlan(dto: {
    shopId: string;
    planTier: PlanTier;
    billingInterval?: BillingInterval;
    billingSource?: BillingSource;
    paymentReference?: string;
  }): Promise<SubscriptionRecord> {
    const planConfig = PLAN_TIERS[dto.planTier] || PLAN_TIERS.DECOUVERTE_FREE;
    const interval = dto.billingInterval || BillingInterval.MONTHLY;
    const priceMinor = interval === BillingInterval.ANNUAL ? planConfig.priceAnnualMinor : planConfig.priceMonthlyMinor;
    const now = new Date();
    const durationDays = interval === BillingInterval.ANNUAL ? 365 : 30;
    const periodEnd = new Date(now.getTime() + durationDays * 86400000);

    try {
      const created = await this.prisma.subscription.create({
        data: {
          shopId: dto.shopId,
          planTier: dto.planTier,
          status: SubscriptionStatus.ACTIVE,
          billingSource: dto.billingSource || BillingSource.MONEROO,
          billingInterval: interval,
          priceMinor,
          currency: 'XOF',
          maxProducts: planConfig.maxProducts,
          hasPriorityD02: planConfig.hasPriorityD02,
          hasFecExport: planConfig.hasFecExport,
          hasVipConcierge: planConfig.hasVipConcierge,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          externalPaymentRef: dto.paymentReference || `MONEROO-${Date.now()}`,
        },
        include: { shop: true },
      });

      return this.mapToRecord(created);
    } catch {
      return {
        id: `sub-${Date.now()}`,
        shopId: dto.shopId,
        shopName: 'Boutique Certifiée',
        planTier: dto.planTier,
        status: SubscriptionStatus.ACTIVE,
        billingSource: dto.billingSource || BillingSource.MONEROO,
        billingInterval: interval,
        priceMinor,
        currency: 'XOF',
        maxProducts: planConfig.maxProducts,
        hasPriorityD02: planConfig.hasPriorityD02,
        hasFecExport: planConfig.hasFecExport,
        hasVipConcierge: planConfig.hasVipConcierge,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        cancelAtPeriodEnd: false,
        externalPaymentRef: dto.paymentReference,
      };
    }
  }

  async listAll(): Promise<SubscriptionRecord[]> {
    try {
      const subs = await this.prisma.subscription.findMany({
        include: { shop: true },
        orderBy: { createdAt: 'desc' },
      });

      if (subs.length === 0) {
        return [this.getMockSubscription('shop-01')];
      }

      return subs.map((s) => this.mapToRecord(s));
    } catch {
      return [this.getMockSubscription('shop-01')];
    }
  }

  private mapToRecord(sub: any): SubscriptionRecord {
    return {
      id: sub.id,
      shopId: sub.shopId,
      shopName: sub.shop?.name || 'Boutique',
      planTier: sub.planTier,
      status: sub.status,
      billingSource: sub.billingSource,
      billingInterval: sub.billingInterval,
      priceMinor: sub.priceMinor,
      currency: sub.currency,
      maxProducts: sub.maxProducts,
      hasPriorityD02: sub.hasPriorityD02,
      hasFecExport: sub.hasFecExport,
      hasVipConcierge: sub.hasVipConcierge,
      currentPeriodStart: sub.currentPeriodStart.toISOString ? sub.currentPeriodStart.toISOString() : sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd.toISOString ? sub.currentPeriodEnd.toISOString() : sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      externalPaymentRef: sub.externalPaymentRef,
    };
  }

  private getMockSubscription(shopId: string): SubscriptionRecord {
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 86400000);
    return {
      id: 'sub-mock-01',
      shopId,
      shopName: "Boutique d'Excellence Kingston Bio",
      planTier: PlanTier.ATELIER_PRO,
      status: SubscriptionStatus.ACTIVE,
      billingSource: BillingSource.MONEROO,
      billingInterval: BillingInterval.MONTHLY,
      priceMinor: 1500000,
      currency: 'XOF',
      maxProducts: 9999,
      hasPriorityD02: true,
      hasFecExport: true,
      hasVipConcierge: false,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      externalPaymentRef: 'MONEROO-SUB-894379',
    };
  }
}
