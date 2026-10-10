import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getSellerOrders } from '@/lib/server/orders';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export const dynamic = 'force-dynamic';

const DAY_MS = 86400000;

/**
 * Seller command-center overview. Every figure is computed from Prisma
 * (orders, variants, cashbook, reviews, requests). No synthetic values.
 */
export async function GET(req: Request) {
  try {
    const context = await requireSellerContext(req);
    const shopId = context.shop.id;

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const seriesStart = new Date(startOfToday.getTime() - 13 * DAY_MS);

    const [
      monthOrders,
      prevMonthOrders,
      seriesOrders,
      fulfillmentGroups,
      paymentPendingCount,
      productsTotal,
      productsPublished,
      lowStockCount,
      outOfStockCount,
      openRequests,
      reviewsAgg,
      todayCash,
      recentOrders,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { shopId, createdAt: { gte: startOfMonth }, fulfillmentStatus: { not: 'CANCELLED' } },
        select: { totalAmountMinor: true, paymentStatus: true },
      }),
      prisma.order.findMany({
        where: {
          shopId,
          createdAt: { gte: startOfPrevMonth, lt: startOfMonth },
          fulfillmentStatus: { not: 'CANCELLED' },
        },
        select: { totalAmountMinor: true },
      }),
      prisma.order.findMany({
        where: { shopId, createdAt: { gte: seriesStart }, fulfillmentStatus: { not: 'CANCELLED' } },
        select: { totalAmountMinor: true, createdAt: true },
      }),
      prisma.order.groupBy({
        by: ['fulfillmentStatus'],
        where: { shopId },
        _count: { _all: true },
      }),
      prisma.order.count({
        where: { shopId, paymentStatus: { in: ['PENDING', 'DECLARED', 'NOT_STARTED'] }, fulfillmentStatus: { not: 'CANCELLED' } },
      }),
      prisma.product.count({ where: { shopId } }),
      prisma.product.count({ where: { shopId, isPublished: true } }),
      prisma.offerVariant.count({ where: { product: { shopId }, stockOnHand: { gt: 0, lte: 2 } } }),
      prisma.offerVariant.count({ where: { product: { shopId }, stockOnHand: { lte: 0 } } }),
      prisma.purchaseRequest.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
      prisma.review.aggregate({ where: { shopId }, _avg: { rating: true }, _count: { _all: true } }),
      prisma.cashbookEntry.findMany({
        where: { shopId, entryDate: { gte: startOfToday } },
        select: { type: true, amountMinor: true },
      }),
      getSellerOrders(shopId).then((list) => list.slice(0, 5)),
    ]);

    const revenueMonthMinor = monthOrders.reduce((acc, o) => acc + o.totalAmountMinor, 0);
    const collectedMonthMinor = monthOrders
      .filter((o) => o.paymentStatus === 'CONFIRMED')
      .reduce((acc, o) => acc + o.totalAmountMinor, 0);
    const revenuePrevMonthMinor = prevMonthOrders.reduce((acc, o) => acc + o.totalAmountMinor, 0);
    // Growth only when a real comparison base exists
    const growthPercent =
      revenuePrevMonthMinor > 0
        ? Math.round(((revenueMonthMinor - revenuePrevMonthMinor) / revenuePrevMonthMinor) * 100)
        : null;

    const series: Array<{ date: string; amountMinor: number; count: number }> = [];
    for (let i = 0; i < 14; i++) {
      const day = new Date(seriesStart.getTime() + i * DAY_MS);
      series.push({ date: day.toISOString().split('T')[0], amountMinor: 0, count: 0 });
    }
    for (const o of seriesOrders) {
      const d = new Date(o.createdAt);
      d.setHours(0, 0, 0, 0);
      const idx = Math.round((d.getTime() - seriesStart.getTime()) / DAY_MS);
      if (idx >= 0 && idx < 14) {
        series[idx].amountMinor += o.totalAmountMinor;
        series[idx].count += 1;
      }
    }

    const byStatus: Record<string, number> = { PENDING: 0, PREPARING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    for (const g of fulfillmentGroups) {
      byStatus[g.fulfillmentStatus] = g._count._all;
    }

    let cashTodayMinor = 0;
    for (const e of todayCash) {
      if (e.type === 'ENCAISSEMENT') cashTodayMinor += e.amountMinor;
      if (e.type === 'DECAISSEMENT') cashTodayMinor -= e.amountMinor;
    }

    const reviewsCount = reviewsAgg._count._all;

    return NextResponse.json({
      shop: {
        id: context.shop.id,
        slug: context.shop.slug,
        name: context.shop.name,
        city: context.shop.city,
        country: context.shop.country,
        currency: context.shop.currency,
        isVerified: context.shop.isVerified,
        kycStatus: context.shop.kycStatus,
      },
      roleInShop: context.roleInShop,
      revenue: {
        monthMinor: revenueMonthMinor,
        collectedMonthMinor,
        prevMonthMinor: revenuePrevMonthMinor,
        growthPercent,
        cashTodayMinor,
      },
      orders: {
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        byStatus,
        toFulfill: byStatus.PENDING + byStatus.PREPARING,
        paymentPending: paymentPendingCount,
        recent: recentOrders,
      },
      catalog: {
        total: productsTotal,
        published: productsPublished,
        drafts: productsTotal - productsPublished,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      requests: { open: openRequests },
      reviews: {
        count: reviewsCount,
        rating: reviewsCount > 0 && reviewsAgg._avg.rating != null ? Number(reviewsAgg._avg.rating.toFixed(1)) : null,
      },
      series,
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message || 'Erreur vue d’ensemble vendeur' }, { status: 500 });
  }
}
