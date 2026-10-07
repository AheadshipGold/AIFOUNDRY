import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/server/orders';
import { getAuthUserFromRequest } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentification requise' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const order = await getOrderById(resolvedParams.id);

    // Authorization: User must be buyer, owner of shop, or ADMIN
    const isBuyer = order.buyerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    let isShopOwner = false;
    if (order.shopId) {
      const shop = await prisma.shop.findUnique({
        where: { id: order.shopId },
        select: { ownerId: true },
      });
      if (shop?.ownerId === user.id) {
        isShopOwner = true;
      }
    }

    if (!isBuyer && !isAdmin && !isShopOwner) {
      return NextResponse.json({ message: 'Accès non autorisé à cette commande' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Commande introuvable' }, { status: 404 });
  }
}
