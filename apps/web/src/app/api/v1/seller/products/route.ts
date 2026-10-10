import { NextResponse } from 'next/server';
import { getSellerCatalog, createProduct } from '@/lib/server/catalog';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function GET(req: Request) {
  try {
    const context = await requireSellerContext(req);
    const products = await getSellerCatalog(context.shop.id);
    return NextResponse.json({
      shopId: context.shop.id,
      shopName: context.shop.name,
      products,
      totalCount: products.length,
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la récupération du catalogue vendeur' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await requireSellerContext(req);
    const body = await req.json();

    if (!body.title || body.priceMinor === undefined || body.priceMinor === null) {
      return NextResponse.json(
        { message: 'Le titre et le prix sont obligatoires pour créer une offre.' },
        { status: 400 }
      );
    }

    const product = await createProduct({
      shopId: context.shop.id,
      title: body.title.trim(),
      description: body.description?.trim(),
      category: body.category || 'artisanat',
      priceMinor: Number(body.priceMinor),
      stockOnHand: body.stockOnHand !== undefined ? Number(body.stockOnHand) : 1,
      originCity: body.originCity || context.shop.city,
      images: Array.isArray(body.images) ? body.images : body.image ? [body.image] : [],
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la création de l’offre' },
      { status: 400 }
    );
  }
}
