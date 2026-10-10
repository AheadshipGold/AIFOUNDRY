import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'OPERATOR')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const recentEntries = await prisma.cashbookEntry.findMany({
      take: 50,
      orderBy: { entryDate: 'desc' },
    });

    const dayClosures = await prisma.dayClosure.findMany({
      take: 20,
      orderBy: { closureDate: 'desc' },
    });

    return NextResponse.json({
      recentEntries,
      dayClosures,
    });
  } catch (error: any) {
    console.error('Error fetching finops ledger:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
