import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shopId,
      planTier = 'ATELIER_PRO',
      billingInterval = 'MONTHLY',
      paymentChannel = 'MTN_MOMO',
      payerPhone,
      payerName,
    } = body;

    // 1. Identify shop
    let targetShop = null;
    const user = await getAuthUserFromRequest(req).catch(() => null);
    if (user?.shop?.id) {
      targetShop = await prisma.shop.findUnique({ where: { id: user.shop.id } });
    }
    if (!targetShop && shopId) {
      targetShop = await prisma.shop.findUnique({ where: { id: shopId } });
    }
    if (!targetShop) {
      targetShop =
        (await prisma.shop.findFirst({ where: { slug: 'kingston-bio' } })) ||
        (await prisma.shop.findFirst());
    }
    if (!targetShop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
    }

    // 2. Validate tier
    const validTiers = ['DECOUVERTE_FREE', 'ATELIER_PRO', 'MAISON_D_ART_PRESTIGE'];
    if (!validTiers.includes(planTier)) {
      return NextResponse.json({ error: 'Forfait marchand invalide' }, { status: 400 });
    }

    // 3. For paid tiers, enforce SaaS Gateway authorization (Flux B - Abonnements Plateforme)
    if (planTier !== 'DECOUVERTE_FREE') {
      const { getSubscriptionGateways } = await import('@/lib/server/subscription-gateways');
      const gateways = await getSubscriptionGateways();

      const isCard = ['CARD', 'DODOPAYMENTS', 'STRIPE'].includes(paymentChannel);
      const isMobile = ['MONEROO', 'MTN_MOMO', 'MOOV_MONEY', 'CELTIIS_CASH', 'WAVE'].includes(paymentChannel);

      if (isCard && !gateways.dodopayments?.isEnabled) {
        return NextResponse.json(
          {
            error: `La passerelle Cartes Bancaires est actuellement suspendue par l'administration (Zero-Trust Guard).`,
          },
          { status: 403 }
        );
      }

      if (isMobile && !gateways.moneroo?.isEnabled) {
        return NextResponse.json(
          {
            error: `La passerelle Mobile Money (Moneroo) est actuellement suspendue par l'administration (Zero-Trust Guard).`,
          },
          { status: 403 }
        );
      }

      if (!isCard && !isMobile && paymentChannel !== 'DIRECT_TRANSFER') {
        return NextResponse.json(
          {
            error: `Canal de souscription non reconnu ("${paymentChannel}").`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Calculate prices & features
    const isAnnual = billingInterval === 'ANNUAL';
    let priceMinor = 0;
    let maxProducts = 5;
    let hasPriorityD02 = false;
    let hasFecExport = false;
    let hasVipConcierge = false;

    if (planTier === 'ATELIER_PRO') {
      priceMinor = isAnnual ? 15000000 : 1500000; // 150 000 / 15 000 FCFA
      maxProducts = 9999;
      hasPriorityD02 = true;
      hasFecExport = true;
      hasVipConcierge = false;
    } else if (planTier === 'MAISON_D_ART_PRESTIGE') {
      priceMinor = isAnnual ? 45000000 : 4500000; // 450 000 / 45 000 FCFA
      maxProducts = 9999;
      hasPriorityD02 = true;
      hasFecExport = true;
      hasVipConcierge = true;
    }

    // 5. Billing source
    let billingSource: 'MTN_MOMO' | 'MOOV_MONEY' | 'WEB_DIRECT' | 'MANUAL_ADMIN' = 'MTN_MOMO';
    if (paymentChannel === 'MOOV_MONEY') billingSource = 'MOOV_MONEY';
    else if (paymentChannel === 'CARD') billingSource = 'WEB_DIRECT';
    else if (paymentChannel === 'DIRECT_TRANSFER') billingSource = 'MANUAL_ADMIN';
    else if (paymentChannel === 'CELTIIS_CASH') billingSource = 'MTN_MOMO';

    const referenceId = `SUB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const durationDays = isAnnual ? 365 : 30;
    const periodEnd = new Date(Date.now() + durationDays * 86400000);

    // 6. Create subscription in Prisma DB
    const newSub = await prisma.subscription.create({
      data: {
        shopId: targetShop.id,
        planTier: planTier as any,
        status: 'ACTIVE',
        billingSource: billingSource as any,
        billingInterval: isAnnual ? 'ANNUAL' : 'MONTHLY',
        priceMinor,
        currency: 'XOF',
        maxProducts,
        hasPriorityD02,
        hasFecExport,
        hasVipConcierge,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        externalPaymentRef: referenceId,
      },
    });

    // 7. If paid, create FinancialEvent in immutable audit ledger
    if (priceMinor > 0) {
      await prisma.financialEvent.create({
        data: {
          shopId: targetShop.id,
          eventType: 'PAYMENT_CONFIRMED',
          amountMinor: priceMinor,
          currency: 'XOF',
          channel: paymentChannel as any,
          source: 'PROVIDER',
          reference: referenceId,
          notes: `Souscription ${planTier} (${billingInterval}) - Réf: ${referenceId}${payerPhone ? ` - Téléphone: ${payerPhone}` : ''}${payerName ? ` - Nom: ${payerName}` : ''}`,
        },
      });
    }

    const tierTitle =
      planTier === 'MAISON_D_ART_PRESTIGE'
        ? 'Grande Enseigne & Prestige'
        : planTier === 'ATELIER_PRO'
        ? 'Plan Boutique Pro'
        : 'Plan Découverte Boutique';

    return NextResponse.json({
      success: true,
      message: `Votre souscription au ${tierTitle} a été confirmée et activée avec succès.`,
      referenceId,
      subscription: {
        id: newSub.id,
        shopId: targetShop.id,
        shopName: targetShop.name,
        planTier: newSub.planTier,
        status: newSub.status,
        billingSource: newSub.billingSource,
        billingInterval: newSub.billingInterval,
        priceMinor: newSub.priceMinor,
        currency: newSub.currency,
        maxProducts: newSub.maxProducts,
        hasPriorityD02: newSub.hasPriorityD02,
        hasFecExport: newSub.hasFecExport,
        hasVipConcierge: newSub.hasVipConcierge,
        currentPeriodStart: newSub.currentPeriodStart.toISOString(),
        currentPeriodEnd: newSub.currentPeriodEnd.toISOString(),
        externalPaymentRef: newSub.externalPaymentRef,
      },
    });
  } catch (err: any) {
    console.error('Subscription checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors du traitement du forfait.' },
      { status: 500 }
    );
  }
}
