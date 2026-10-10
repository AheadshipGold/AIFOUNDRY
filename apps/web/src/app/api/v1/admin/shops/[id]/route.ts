import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès réservé à l'administration" },
        { status: 403 }
      );
    }
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const isVerified = status === 'VERIFIED_PRO' || status === 'VERIFIED';
    const newKycStatus = status === 'VERIFIED_PRO' ? 'VERIFIED' : (status === 'SUSPENDED' ? 'SUSPENDED' : status);

    const oldShop = await prisma.shop.findUnique({ where: { id } });
    if (!oldShop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const updatedShop = await prisma.shop.update({
      where: { id },
      data: {
        isVerified,
        kycStatus: newKycStatus,
      },
    });

    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    await prisma.adminAuditLog.create({
      data: {
        adminId: user.id,
        action: 'UPDATE_SHOP_STATUS',
        targetResource: 'Shop',
        targetId: id,
        ipAddress,
        beforeState: { kycStatus: oldShop.kycStatus, isVerified: oldShop.isVerified },
        afterState: { kycStatus: updatedShop.kycStatus, isVerified: updatedShop.isVerified },
      },
    });

    return NextResponse.json(updatedShop);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
