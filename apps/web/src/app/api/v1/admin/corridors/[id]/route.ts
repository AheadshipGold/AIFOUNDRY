import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'OPERATOR')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { isEnabled } = body;

    const corridor = await prisma.paymentCorridorRule.update({
      where: { id: params.id },
      data: { isEnabled },
    });

    // Optional: Log the action in AdminAuditLog
    try {
      const adminUser = await prisma.adminUser.findUnique({ where: { email: user.email } });
      if (adminUser) {
        await prisma.adminAuditLog.create({
          data: {
            adminId: adminUser.id,
            action: 'TOGGLE_CORRIDOR',
            targetResource: 'PaymentCorridorRule',
            targetId: params.id,
            afterState: { isEnabled },
          }
        });
      }
    } catch (e) {
      console.error("Could not create audit log:", e);
    }

    return NextResponse.json(corridor);
  } catch (error: any) {
    console.error('Error updating corridor:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
