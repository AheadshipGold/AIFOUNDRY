import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { pullSyncChanges } from '@/lib/server/sync';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const since = req.nextUrl.searchParams.get('since') || undefined;
    const changes = await pullSyncChanges(user.id, since);
    return NextResponse.json(changes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
