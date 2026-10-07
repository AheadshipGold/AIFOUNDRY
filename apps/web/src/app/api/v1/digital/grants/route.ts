import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { getUserDigitalGrants } from '@/lib/server/digital';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const grants = await getUserDigitalGrants(user.id);
    return NextResponse.json(grants);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
