import { NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { getFavoriteIds } from '@/lib/server/engagement';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) return NextResponse.json([]);
  try {
    return NextResponse.json(await getFavoriteIds(userId));
  } catch {
    return NextResponse.json([]);
  }
}
