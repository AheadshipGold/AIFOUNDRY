import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function GET(req: Request) {
  try {
    const context = await requireSellerContext(req);
    const shop = await prisma.shop.findUnique({
      where: { id: context.shop.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            proposals: true,
            reviews: true,
          },
        },
        paymentConnections: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!shop) {
      return NextResponse.json({ message: 'Boutique introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      shop: {
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        description: shop.description || '',
        craftType: shop.craftType || 'Atelier de Création',
        city: shop.city,
        country: shop.country,
        currency: shop.currency,
        isVerified: shop.isVerified,
        kycStatus: shop.kycStatus,
        kycNotes: shop.kycNotes,
        storefrontTheme: shop.storefrontTheme || 'light',
        bannerUrl: shop.bannerUrl,
        customLayout: shop.customLayout,
        createdAt: shop.createdAt.toISOString(),
        owner: shop.owner,
        counts: shop._count,
        activeSubscription: shop.subscriptions[0] || null,
        paymentConnections: shop.paymentConnections,
      },
      roleInShop: context.roleInShop,
      isOwner: context.isOwner,
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la récupération de la boutique' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const context = await requireSellerContext(req);
    const body = await req.json();

    const allowedFields = [
      'name',
      'description',
      'craftType',
      'city',
      'country',
      'storefrontTheme',
      'bannerUrl',
      'customLayout',
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (body.name && body.name.trim() !== context.shop.name) {
      // Regenerate or ensure valid slug if needed, or keep stable slug
      data.name = body.name.trim();
    }

    const updatedShop = await prisma.shop.update({
      where: { id: context.shop.id },
      data,
    });

    return NextResponse.json({
      success: true,
      shop: updatedShop,
      message: 'Paramètres de la boutique enregistrés avec succès',
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la mise à jour de la boutique' },
      { status: 400 }
    );
  }
}
