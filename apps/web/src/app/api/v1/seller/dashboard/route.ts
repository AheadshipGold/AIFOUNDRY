import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/server/finops';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId') || undefined;
  const userId = await extractUserIdFromRequest(req);

  try {
    const metrics = await getDashboardMetrics(shopId, userId || undefined);
    return NextResponse.json(metrics);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur tableau de bord' }, { status: 500 });
  }
}
