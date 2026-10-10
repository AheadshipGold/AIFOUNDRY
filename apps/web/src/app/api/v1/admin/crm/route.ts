import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getAuthUserFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès réservé à l'administration" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase() || '';

    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        avatarUrl: true,
        ownedShops: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const mappedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
      isSeller: u.ownedShops.length > 0,
      shopDetails: u.ownedShops[0] || null,
      ordersCount: u._count.orders,
    }));

    return NextResponse.json(mappedUsers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
