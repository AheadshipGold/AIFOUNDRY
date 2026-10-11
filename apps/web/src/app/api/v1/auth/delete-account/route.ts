import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function POST(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Session invalide ou expirée.' }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({
        where: { userId },
      });

      await tx.favorite.deleteMany({
        where: { userId },
      });

      await tx.review.deleteMany({
        where: { buyerId: userId },
      });

      // Delete user reservations & orders
      const userOrders = await tx.order.findMany({
        where: { buyerId: userId },
        select: { id: true },
      });
      const orderIds = userOrders.map((o) => o.id);
      if (orderIds.length > 0) {
        await tx.reservation.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.financialEvent.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.orderLine.deleteMany({
          where: { orderId: { in: orderIds } },
        });
        await tx.order.deleteMany({
          where: { id: { in: orderIds } },
        });
      }

      // Delete user purchase requests & proposals
      const userRequests = await tx.purchaseRequest.findMany({
        where: { buyerId: userId },
        select: { id: true },
      });
      const reqIds = userRequests.map((r) => r.id);
      if (reqIds.length > 0) {
        await tx.sellerProposal.deleteMany({
          where: { requestId: { in: reqIds } },
        });
        await tx.purchaseRequest.deleteMany({
          where: { id: { in: reqIds } },
        });
      }

      await tx.shopMembership.deleteMany({
        where: { userId },
      });

      await tx.account.deleteMany({
        where: { userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Compte et données personnelles supprimés définitivement avec succès.',
    });
  } catch (err: any) {
    console.error('[DeleteAccount Error]', err);
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la suppression du compte.' },
      { status: 500 }
    );
  }
}