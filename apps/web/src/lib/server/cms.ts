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
      const [reviews, variants] = await Promise.all([
        prisma.review.findMany({
          where: { productId: { in: prodIds } },
        }),
        prisma.offerVariant.findMany({
          where: { productId: { in: prodIds } },
          select: { productId: true, stockOnHand: true, stockReserved: true, isAvailable: true },
        }),
      ]);

      const reviewMap: Record<string, { total: number; count: number }> = {};
      reviews.forEach((r) => {
        if (r.productId) {
          if (!reviewMap[r.productId]) reviewMap[r.productId] = { total: 0, count: 0 };
          reviewMap[r.productId].total += r.rating;
          reviewMap[r.productId].count += 1;
        }
      });

      const stockMap: Record<string, number> = {};
      variants.forEach((v) => {
        if (v.productId) {
          const available = v.isAvailable ? Math.max(0, v.stockOnHand - v.stockReserved) : 0;
          stockMap[v.productId] = (stockMap[v.productId] || 0) + available;
        }
      });

      data.featuredProducts = data.featuredProducts.map((p: any) => {
        const stats = reviewMap[p.id];
        const reviewsCount = stats ? stats.count : 0;
        const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
        const realStock = stockMap[p.id] !== undefined ? stockMap[p.id] : (typeof p.stock === 'number' ? p.stock : 1);
        return { ...p, rating, reviewsCount, stock: realStock };
      });
    }
  }

  if (data.intemporelIcons && Array.isArray(data.intemporelIcons)) {
    const prodIds = data.intemporelIcons.map((p: any) => p.id).filter(Boolean);
    if (prodIds.length > 0) {
      const [reviews, variants] = await Promise.all([
        prisma.review.findMany({
          where: { productId: { in: prodIds } },
        }),
        prisma.offerVariant.findMany({
          where: { productId: { in: prodIds } },
          select: { productId: true, stockOnHand: true, stockReserved: true, isAvailable: true },
        }),
      ]);

      const reviewMap: Record<string, { total: number; count: number }> = {};
      reviews.forEach((r) => {
        if (r.productId) {
          if (!reviewMap[r.productId]) reviewMap[r.productId] = { total: 0, count: 0 };
          reviewMap[r.productId].total += r.rating;
          reviewMap[r.productId].count += 1;
        }
      });

      const stockMap: Record<string, number> = {};
      variants.forEach((v) => {
        if (v.productId) {
          const available = v.isAvailable ? Math.max(0, v.stockOnHand - v.stockReserved) : 0;
          stockMap[v.productId] = (stockMap[v.productId] || 0) + available;
        }
      });

      data.intemporelIcons = data.intemporelIcons.map((p: any) => {
        const stats = reviewMap[p.id];
        const reviewsCount = stats ? stats.count : 0;
        const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
        const realStock = stockMap[p.id] !== undefined ? stockMap[p.id] : (typeof p.stock === 'number' ? p.stock : 1);
        return { ...p, rating, reviewsCount, stock: realStock };
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

  // Bidirectional Synchronization: Ensure all CMS featured products exist in the store catalog
  if (data?.featuredProducts && Array.isArray(data.featuredProducts)) {
    for (const p of data.featuredProducts) {
      if (!p || !p.id || !p.title) continue;

      const targetShopId = p.seller?.id || 'd2e05cf4-d782-4fe4-9cd6-a6dd73f2db73';
      const priceMinor = Math.round((Number(p.price) || 0) * 100);

      try {
        const existingProduct = await prisma.product.findUnique({
          where: { id: p.id },
          include: { variants: true },
        });

        if (existingProduct) {
          await prisma.product.update({
            where: { id: p.id },
            data: {
              title: p.title,
              description: p.description || '',
              category: p.category || 'artisanat',
              images: p.image ? [p.image] : existingProduct.images,
              shopId: targetShopId,
            },
          });

          if (existingProduct.variants && existingProduct.variants.length > 0) {
            await prisma.offerVariant.update({
              where: { id: existingProduct.variants[0].id },
              data: {
                name: p.title,
                priceMinor: priceMinor > 0 ? priceMinor : existingProduct.variants[0].priceMinor,
                currency: 'XOF',
                isAvailable: true,
              },
            });
          } else {
            await prisma.offerVariant.create({
              data: {
                productId: p.id,
                sku: `SKU-${p.id.slice(0, 8).toUpperCase()}`,
                name: p.title,
                priceMinor: priceMinor,
                currency: 'XOF',
                stockOnHand: 10,
                stockReserved: 0,
                isAvailable: true,
              },
            });
          }
        } else {
          await prisma.product.create({
            data: {
              id: p.id,
              shopId: targetShopId,
              title: p.title,
              description: p.description || '',
              category: p.category || 'artisanat',
              images: p.image ? [p.image] : [],
              isPublished: true,
              originCity: p.originCity || 'Cotonou',
              variants: {
                create: {
                  sku: `SKU-${p.id.slice(0, 8).toUpperCase()}`,
                  name: p.title,
                  priceMinor: priceMinor,
                  currency: 'XOF',
                  stockOnHand: 10,
                  stockReserved: 0,
                  isAvailable: true,
                },
              },
            },
          });
        }
      } catch (syncErr) {
        console.warn(`Could not sync CMS product [${p.id}] with store catalog:`, syncErr);
      }
    }
  }

  const config = await prisma.platformConfig.upsert({
    where: { id: 'cms_main' },
    update: { data },
    create: { id: 'cms_main', data },
  });
  return config;
}
