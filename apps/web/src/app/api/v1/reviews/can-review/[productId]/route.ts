import { NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { canReview } from '@/lib/server/engagement';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ canReview: false, hasPurchased: false, existingReview: null });
  try {
    return NextResponse.json(await canReview(userId, params.productId));
  } catch {
    return NextResponse.json({ canReview: false, hasPurchased: false, existingReview: null });
  }
}
