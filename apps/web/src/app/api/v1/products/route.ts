import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/server/catalog';

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
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur création produit' }, { status: 400 });
  }
}
