import { NextRequest, NextResponse } from 'next/server';
import { updateSellerProduct, deleteSellerProduct } from '@/lib/server/catalog';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireSellerContext(req);
    const body = await req.json();

    const updated = await updateSellerProduct(id, context.shop.id, {
      title: body.title,
      description: body.description,
      category: body.category,
      originCity: body.originCity,
      priceMinor: body.priceMinor !== undefined ? Number(body.priceMinor) : undefined,
      stockOnHand: body.stockOnHand !== undefined ? Number(body.stockOnHand) : undefined,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
      images: Array.isArray(body.images) ? body.images : body.image ? [body.image] : undefined,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la mise à jour du produit' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireSellerContext(req);
    await deleteSellerProduct(id, context.shop.id);
    return NextResponse.json({ success: true, message: 'Produit retiré avec succès' });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la suppression du produit' },
      { status: 400 }
    );
  }
}
