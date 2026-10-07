import { NextResponse } from 'next/server';
import { getShopBySlug } from '@/lib/server/catalog';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const shop = await getShopBySlug(params.slug);
    return NextResponse.json(shop);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Boutique introuvable' }, { status: 404 });
  }
}
