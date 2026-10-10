import { NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { getFavorites } from '@/lib/server/engagement';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ message: 'Authentification requise' }, { status: 401 });
  try {
    return NextResponse.json(await getFavorites(userId));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur favoris' }, { status: 500 });
  }
}
