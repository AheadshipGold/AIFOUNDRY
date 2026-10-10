import { NextResponse } from 'next/server';
import { getShopBySlug } from '@/lib/server/catalog';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    const resolvedParams = await params;
    const shop = await getShopBySlug(resolvedParams.slug);
    return NextResponse.json(shop);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Boutique introuvable' }, { status: 404 });
  }
}
