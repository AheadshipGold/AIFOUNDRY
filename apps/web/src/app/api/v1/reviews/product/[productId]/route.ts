import { NextResponse } from 'next/server';
import { getProductReviews } from '@/lib/server/engagement';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { productId: string } }) {
  try {
    return NextResponse.json(await getProductReviews(params.productId));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur avis' }, { status: 500 });
  }
}
