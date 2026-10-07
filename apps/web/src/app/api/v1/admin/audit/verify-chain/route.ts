import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { verifyAuditChainIntegrity } from '@/lib/server/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès réservé à l\'administration' }, { status: 403 });
    }
    const result = await verifyAuditChainIntegrity();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
