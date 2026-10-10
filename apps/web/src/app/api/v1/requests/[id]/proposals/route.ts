import { NextResponse } from 'next/server';
import { submitProposal } from '@/lib/server/requests';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const context = await requireSellerContext(req);
    const body = await req.json();

    if (!body.priceMinor) {
      return NextResponse.json(
        { message: 'Le montant proposé est obligatoire' },
        { status: 400 }
      );
    }

    const proposal = await submitProposal(params.id, {
      shopId: context.shop.id,
      priceMinor: Number(body.priceMinor),
      advancePaymentRequiredMinor: body.advancePaymentRequiredMinor ? Number(body.advancePaymentRequiredMinor) : 0,
      productionDays: body.productionDays ? Number(body.productionDays) : 7,
      proposalNotes: body.proposalNotes || body.notes || 'Proposition d’artisan certifié',
      offerVariantId: body.offerVariantId,
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la soumission de la proposition' },
      { status: 400 }
    );
  }
}
