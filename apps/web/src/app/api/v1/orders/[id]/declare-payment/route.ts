import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const body = await req.json();
    const { transactionRef, notes, proofUrl } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { shop: true },
    });

    if (!order) {
      return NextResponse.json({ message: 'Commande introuvable' }, { status: 404 });
    }

    if (userId && order.buyerId && order.buyerId !== userId) {
      // Allow if admin
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
      }
    }

    const refText = transactionRef ? `Réf transaction : ${transactionRef}` : 'Preuve de virement soumise';
    const noteText = notes ? `${refText} · ${notes}` : refText;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update order status
      const ord = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'DECLARED',
          verificationSource: 'PROVIDER',
          notes: order.notes ? `${order.notes}\n[Preuve de paiement] ${noteText}` : `[Preuve de paiement] ${noteText}`,
        },
        include: {
          lines: { include: { variant: true } },
          buyer: true,
          shop: { include: { paymentConnections: true } },
        },
      });

      // 2. Audit FinOps event
      await tx.financialEvent.create({
        data: {
          shopId: order.shopId,
          orderId: order.id,
          eventType: 'PAYMENT_DECLARED',
          amountMinor: order.totalAmountMinor,
          currency: order.currency,
          source: 'PROVIDER',
          channel: order.paymentChannel,
          reference: transactionRef || order.orderNumber,
          notes: noteText,
        },
      });

      return ord;
    });

    return NextResponse.json({
      success: true,
      message: 'Preuve de paiement transmise au marchand avec succès.',
      order: {
        id: updated.id,
        orderNumber: updated.orderNumber,
        paymentStatus: updated.paymentStatus,
      },
    });
  } catch (err: any) {
    console.error('[Declare Payment Error]', err);
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la déclaration du paiement' },
      { status: 500 }
    );
  }
}
