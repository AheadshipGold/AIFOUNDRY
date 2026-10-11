import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const body = await req.json();
    const { proposalId } = body;

    if (!proposalId) {
      return NextResponse.json({ message: 'Identifiant du devis requis' }, { status: 400 });
    }

    const proposal = await prisma.sellerProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: { include: { buyer: true } },
        shop: true,
      },
    });

    if (!proposal || proposal.requestId !== params.id) {
      return NextResponse.json({ message: 'Devis introuvable pour cette demande' }, { status: 404 });
    }

    const effectiveBuyerId = userId || proposal.request.buyerId;
    const buyer = await prisma.user.findUnique({ where: { id: effectiveBuyerId } });

    const orderNumber = `OJK-BESPOKE-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Mark proposal as ACCEPTED
      await tx.sellerProposal.update({
        where: { id: proposal.id },
        data: { status: 'ACCEPTED' },
      });

      // 2. Mark other proposals as REJECTED
      await tx.sellerProposal.updateMany({
        where: {
          requestId: params.id,
          id: { not: proposal.id },
        },
        data: { status: 'DECLINED' },
      });

      // 3. Mark request as MATCHED
      await tx.purchaseRequest.update({
        where: { id: params.id },
        data: { status: 'MATCHED' },
      });

      // 4. Create real Order
      return tx.order.create({
        data: {
          orderNumber,
          shopId: proposal.shopId,
          buyerId: effectiveBuyerId,
          totalAmountMinor: proposal.priceMinor,
          grossSaleAmountMinor: proposal.priceMinor,
          currency: proposal.currency || 'XOF',
          paymentChannel: 'MTN_MOMO',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'PREPARING',
          deliveryAddress: 'Confection sur-mesure D02 — ' + (proposal.shop.city || 'Cotonou'),
          notes: `Commande issue de la demande sur-mesure [${proposal.request.title}]. Acompte requis: ${proposal.advancePaymentRequiredMinor} ${proposal.currency}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Devis accepté et commande générée avec succès.',
      orderNumber: order.orderNumber,
      orderId: order.id,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[AcceptProposal Error]', err);
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la validation du devis' },
      { status: 500 }
    );
  }
}