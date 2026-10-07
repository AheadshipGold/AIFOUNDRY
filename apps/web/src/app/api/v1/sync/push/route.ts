import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { pushSyncMutations } from '@/lib/server/sync';

export const maxDuration = 60; // 60s timeout for bulk mutation sync

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const body = await req.json();
    const mutations = Array.isArray(body) ? body : body.mutations || [];
    const results = await pushSyncMutations(user.id, mutations);
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
