import { prisma } from './prisma';
import { getProductById } from './catalog';

// ==============================================================================
// FAVORITES (WISHLIST)
// ==============================================================================

export async function toggleFavorite(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw new Error('Produit introuvable');

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId, productId } });
  }

  const totalFavorites = await prisma.favorite.count({ where: { productId } });
  return { isFavorite: !existing, productId, totalFavorites };
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const rows = await prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
  return rows.map((r) => r.productId);
}

export async function getFavorites(userId: string) {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { productId: true, createdAt: true },
  });
  const products = await Promise.all(
    rows.map((r) => getProductById(r.productId).catch(() => null))
  );
  return products.filter(Boolean);
}

// ==============================================================================
// VERIFIED REVIEWS (Amazon / Airbnb rule: confirmed paid purchase only)
// ==============================================================================

async function findVerifiedOrder(userId: string, productId: string) {
  return prisma.order.findFirst({
    where: {
      buyerId: userId,
      paymentStatus: 'CONFIRMED',
      fulfillmentStatus: { not: 'CANCELLED' },
      lines: { some: { variant: { productId } } },
    },
    select: { id: true, shopId: true },
  });
}

function mapReview(r: any) {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isVerified: r.isVerified,
    productId: r.productId,
    productTitle: r.product?.title,
    buyerName: r.buyer?.name || 'Client vérifié',
    createdAt: r.createdAt.toISOString(),
  };
}

export async function getProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { buyer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const reviewsCount = reviews.length;
  const averageRating =
    reviewsCount > 0 ? Number((reviews.reduce((a, r) => a + r.rating, 0) / reviewsCount).toFixed(1)) : null;
  return { averageRating, reviewsCount, reviews: reviews.map(mapReview) };
}

export async function getShopReviews(shopId: string) {
  const reviews = await prisma.review.findMany({
    where: { shopId },
    include: { buyer: { select: { name: true } }, product: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const reviewsCount = reviews.length;
  const shopRating =
    reviewsCount > 0 ? Number((reviews.reduce((a, r) => a + r.rating, 0) / reviewsCount).toFixed(1)) : null;
  return { shopRating, reviewsCount, reviews: reviews.map(mapReview) };
}

export async function canReview(userId: string, productId: string) {
  const [order, existing] = await Promise.all([
    findVerifiedOrder(userId, productId),
    prisma.review.findUnique({ where: { buyerId_productId: { buyerId: userId, productId } } }),
  ]);
  return {
    canReview: Boolean(order) && !existing,
    hasPurchased: Boolean(order),
    existingReview: existing ? mapReview({ ...existing, buyer: null }) : null,
  };
}

export async function createReview(
  userId: string,
  dto: { productId: string; rating: number; title?: string; comment?: string }
) {
  const rating = Math.round(Number(dto.rating));
  if (!dto.productId) throw new Error('Produit requis');
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error('La note doit être comprise entre 1 et 5 étoiles');
  }

  const order = await findVerifiedOrder(userId, dto.productId);
  if (!order) {
    throw new Error('Seuls les acheteurs ayant une commande payée et confirmée peuvent laisser un avis.');
  }

  const existing = await prisma.review.findUnique({
    where: { buyerId_productId: { buyerId: userId, productId: dto.productId } },
  });
  if (existing) throw new Error('Vous avez déjà publié un avis pour cette création.');

  const review = await prisma.review.create({
    data: {
      buyerId: userId,
      productId: dto.productId,
      shopId: order.shopId,
      orderId: order.id,
      rating,
      title: dto.title?.trim() || null,
      comment: dto.comment?.trim() || null,
      isVerified: true,
    },
    include: { buyer: { select: { name: true } } },
  });
  return mapReview(review);
}
