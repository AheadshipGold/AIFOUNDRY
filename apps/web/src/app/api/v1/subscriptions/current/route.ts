import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let shop = null;

    // 1. Try to get user from auth token/cookie
    const user = await getAuthUserFromRequest(req).catch(() => null);
    if (user?.shop?.id) {
      shop = await prisma.shop.findUnique({
        where: { id: user.shop.id },
      });
    }

    // 2. Fallback to default boutique (Kingston Bio)
    if (!shop) {
      shop =
        (await prisma.shop.findFirst({
          where: { slug: 'kingston-bio' },
        })) || (await prisma.shop.findFirst());
    }

    if (!shop) {
      return NextResponse.json({ error: 'Aucune boutique configurée' }, { status: 404 });
    }

    // 3. Find latest subscription in DB
    let sub = await prisma.subscription.findFirst({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'desc' },
    });

    // 4. If none exists, create default initial subscription in DB
    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          shopId: shop.id,
          planTier: 'ATELIER_PRO',
          status: 'ACTIVE',
          billingSource: 'MTN_MOMO',
          billingInterval: 'MONTHLY',
          priceMinor: 1500000,
          currency: 'XOF',
          maxProducts: 9999,
          hasPriorityD02: true,
          hasFecExport: true,
          hasVipConcierge: false,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
          externalPaymentRef: 'INIT-ATELIER-PRO',
        },
      });
    }

    return NextResponse.json({
      id: sub.id,
      shopId: shop.id,
      shopName: shop.name,
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
      currentPeriodStart: sub.currentPeriodStart.toISOString(),
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      externalPaymentRef: sub.externalPaymentRef,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
