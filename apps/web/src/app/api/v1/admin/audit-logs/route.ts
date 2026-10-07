import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { getAuditLogs } from '@/lib/server/admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès réservé à l\'administration' }, { status: 403 });
    }
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);
    const logs = await getAuditLogs(limit);
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
