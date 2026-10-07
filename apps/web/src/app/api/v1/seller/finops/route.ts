import { NextResponse } from 'next/server';
import { getFinOpsEntries } from '@/lib/server/finops';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId') || undefined;
  const userId = await extractUserIdFromRequest(req);

  try {
    const entries = await getFinOpsEntries(shopId, userId || undefined);
    return NextResponse.json(entries);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur caisse' }, { status: 500 });
  }
}
