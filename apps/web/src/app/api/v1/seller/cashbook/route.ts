import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getCashbook } from '@/lib/server/finops';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function GET(req: NextRequest) {
  try {
    const context = await requireSellerContext(req);
    const data = await getCashbook(context.shop.id, context.user.id);
    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireSellerContext(req);
    const body = await req.json();

    if (!body.amountMinor || Number(body.amountMinor) <= 0) {
      return NextResponse.json(
        { message: 'Le montant de l’opération doit être supérieur à zéro.' },
        { status: 400 }
      );
    }

    const type = body.type === 'DECAISSEMENT' ? 'DECAISSEMENT' : 'ENCAISSEMENT';
    let channel: any = 'CASH_ON_DELIVERY';
    if (body.channel === 'MTN_MOMO') channel = 'MTN_MOMO';
    else if (body.channel === 'MOOV_MONEY') channel = 'MOOV_MONEY';
    else if (body.channel === 'CELTIIS_CASH') channel = 'CELTIIS_CASH';
    else if (body.channel === 'CARD') channel = 'CARD';
    else if (body.channel === 'DIRECT_TRANSFER') channel = 'DIRECT_TRANSFER';
    else if (body.channel === 'PICKUP') channel = 'PICKUP';

    const reference = body.reference || `REC-${Date.now().toString(36).toUpperCase()}`;

    const entry = await prisma.cashbookEntry.create({
      data: {
        shopId: context.shop.id,
        type: type as any,
        amountMinor: Number(body.amountMinor),
        currency: context.shop.currency || 'XOF',
        channel,
        reference,
        notes: body.label || body.notes || 'Encaissement manuel boutique',
        entryDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        type: entry.type,
        label: entry.notes,
        channel: entry.channel,
        amountMinor: entry.amountMinor,
        currency: entry.currency,
        reference: entry.reference,
        time: entry.entryDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
      message: 'Écriture de caisse enregistrée avec succès',
    }, { status: 201 });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de l’enregistrement de l’écriture de caisse' },
      { status: 400 }
    );
  }
}
