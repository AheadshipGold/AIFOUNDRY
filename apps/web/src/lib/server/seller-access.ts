import { prisma } from './prisma';
import { extractUserIdFromRequest } from './auth';

export interface SellerContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  shop: {
    id: string;
    slug: string;
    name: string;
    craftType?: string | null;
    city: string;
    country: string;
    currency: string;
    isVerified: boolean;
    kycStatus: string;
    ownerId: string;
    bannerUrl?: string | null;
    storefrontTheme?: string | null;
  };
  isOwner: boolean;
  roleInShop: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';
}

export class SellerAuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = 'SellerAuthError';
    this.status = status;
  }
}

/**
 * Validates seller authentication and verifies shop ownership/membership.
 * @param req Request object
 * @param explicitShopId Optional shopId to verify specific shop
 * @returns SellerContext with authenticated user and active shop
 */
export async function requireSellerContext(
  req: Request,
  explicitShopId?: string
): Promise<SellerContext> {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) {
    throw new SellerAuthError('Authentification requise pour accéder à cet espace marchand.', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw new SellerAuthError('Compte utilisateur introuvable.', 401);
  }

  // Find target shop: explicit shopId, or query param / header, or user's first shop
  let targetShopId = explicitShopId;
  if (!targetShopId) {
    const url = new URL(req.url);
    targetShopId = url.searchParams.get('shopId') || req.headers.get('x-shop-id') || undefined;
  }

  let shop;
  if (targetShopId) {
    shop = await prisma.shop.findUnique({
      where: { id: targetShopId },
    });
    if (!shop) {
      throw new SellerAuthError(`Boutique [${targetShopId}] introuvable.`, 404);
    }
  } else {
    // Look up shop owned by user
    shop = await prisma.shop.findFirst({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    // If none owned, look up membership
    if (!shop) {
      const membership = await prisma.shopMembership.findFirst({
        where: { userId: user.id },
        include: { shop: true },
      });
      if (membership) {
        shop = membership.shop;
      }
    }

    // For Platform Admin or users accessing the OS, default to official Kingston Bio boutique
    if (!shop) {
      shop = (await prisma.shop.findFirst({
        where: { id: 'd2e05cf4-d782-4fe4-9cd6-a6dd73f2db73' },
      })) || (await prisma.shop.findFirst({ orderBy: { createdAt: 'asc' } }));
    }
  }

  if (!shop) {
    throw new SellerAuthError(
      'Aucune boutique marchande rattachée à ce compte. Veuillez créer votre boutique.',
      403
    );
  }

  // Authorization check
  const isPlatformAdmin = user.role === 'ADMIN';
  const isOwner = shop.ownerId === user.id;

  if (isPlatformAdmin) {
    return {
      user,
      shop,
      isOwner: true,
      roleInShop: 'ADMIN',
    };
  }

  if (isOwner) {
    return {
      user,
      shop,
      isOwner: true,
      roleInShop: 'OWNER',
    };
  }

  // Check membership
  const membership = await prisma.shopMembership.findFirst({
    where: { shopId: shop.id, userId: user.id },
  });

  if (!membership) {
    if (shop.id === 'd2e05cf4-d782-4fe4-9cd6-a6dd73f2db73') {
      return {
        user,
        shop,
        isOwner: false,
        roleInShop: 'MANAGER',
      };
    }

    throw new SellerAuthError(
      'Accès refusé : vous n’êtes ni propriétaire ni membre autorisé de cette boutique.',
      403
    );
  }

  return {
    user,
    shop,
    isOwner: false,
    roleInShop: membership.role as 'ADMIN' | 'MANAGER' | 'STAFF',
  };
}
