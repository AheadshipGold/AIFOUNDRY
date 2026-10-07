import { prisma } from './prisma';

export async function getLandingConfig() {
  const config = await prisma.platformConfig.findUnique({
    where: { id: 'cms_main' },
  });
  if (!config || !config.data) {
    return { data: {} };
  }

  const data = JSON.parse(JSON.stringify(config.data));

  if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
    const prodIds = data.featuredProducts.map((p: any) => p.id).filter(Boolean);
    if (prodIds.length > 0) {
      const reviews = await prisma.review.findMany({
        where: { productId: { in: prodIds } },
      });
      const reviewMap: Record<string, { total: number; count: number }> = {};
      reviews.forEach((r) => {
        if (r.productId) {
          if (!reviewMap[r.productId]) reviewMap[r.productId] = { total: 0, count: 0 };
          reviewMap[r.productId].total += r.rating;
          reviewMap[r.productId].count += 1;
        }
      });

      data.featuredProducts = data.featuredProducts.map((p: any) => {
        const stats = reviewMap[p.id];
        const reviewsCount = stats ? stats.count : 0;
        const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
        return { ...p, rating, reviewsCount };
      });
    }
  }

  if (data.intemporelIcons && Array.isArray(data.intemporelIcons)) {
    const prodIds = data.intemporelIcons.map((p: any) => p.id).filter(Boolean);
    if (prodIds.length > 0) {
      const reviews = await prisma.review.findMany({
        where: { productId: { in: prodIds } },
      });
      const reviewMap: Record<string, { total: number; count: number }> = {};
      reviews.forEach((r) => {
        if (r.productId) {
          if (!reviewMap[r.productId]) reviewMap[r.productId] = { total: 0, count: 0 };
          reviewMap[r.productId].total += r.rating;
          reviewMap[r.productId].count += 1;
        }
      });

      data.intemporelIcons = data.intemporelIcons.map((p: any) => {
        const stats = reviewMap[p.id];
        const reviewsCount = stats ? stats.count : 0;
        const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
        return { ...p, rating, reviewsCount };
      });
    }
  }

  if (data.trustedShops && Array.isArray(data.trustedShops)) {
    const shopIds = data.trustedShops.map((s: any) => s.id).filter(Boolean);
    if (shopIds.length > 0) {
      const reviews = await prisma.review.findMany({
        where: { shopId: { in: shopIds } },
      });
      const shopReviewMap: Record<string, { total: number; count: number }> = {};
      reviews.forEach((r) => {
        if (r.shopId) {
          if (!shopReviewMap[r.shopId]) shopReviewMap[r.shopId] = { total: 0, count: 0 };
          shopReviewMap[r.shopId].total += r.rating;
          shopReviewMap[r.shopId].count += 1;
        }
      });

      data.trustedShops = data.trustedShops.map((s: any) => {
        const stats = shopReviewMap[s.id];
        const reviewsCount = stats ? stats.count : 0;
        const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
        return { ...s, rating, reviews: reviewsCount };
      });
    }
  }

  return { ...config, data };
}

export async function updateLandingConfig(data: any, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Accès refusé');
  }

  const config = await prisma.platformConfig.upsert({
    where: { id: 'cms_main' },
    update: { data },
    create: { id: 'cms_main', data },
  });
  return config;
}
