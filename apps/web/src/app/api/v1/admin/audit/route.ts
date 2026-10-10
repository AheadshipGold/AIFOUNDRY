import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'OPERATOR')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const logs = await prisma.adminAuditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: true,
      }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
