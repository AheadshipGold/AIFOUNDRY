import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { getCurrentSubscription } from '@/lib/server/moneroo';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const sub = await getCurrentSubscription(user.id);
    return NextResponse.json(sub);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
