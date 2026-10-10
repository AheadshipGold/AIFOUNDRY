import { NextResponse } from 'next/server';
import { getShopReviews } from '@/lib/server/engagement';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { shopId: string } }) {
  try {
    return NextResponse.json(await getShopReviews(params.shopId));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur avis' }, { status: 500 });
  }
}
