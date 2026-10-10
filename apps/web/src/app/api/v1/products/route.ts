import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/server/catalog';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const shopId = searchParams.get('shopId') || undefined;

  try {
    const products = await getProducts(q, category, shopId);
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur catalogue' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate seller context: ensures caller owns or manages target shop (or caller's primary shop)
    const context = await requireSellerContext(req, body.shopId);

    if (!body.title || body.priceMinor === undefined || body.priceMinor === null) {
      return NextResponse.json(
        { message: 'Le titre et le prix sont obligatoires pour créer une offre marchande.' },
        { status: 400 }
      );
    }

    const product = await createProduct({
      ...body,
      shopId: context.shop.id, // Enforce authenticated shop
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message || 'Erreur création produit' }, { status: 400 });
  }
}
