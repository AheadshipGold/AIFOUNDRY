import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLandingConfig() {
    const config = await this.prisma.platformConfig.findUnique({
      where: { id: 'cms_main' },
    });
    if (!config || !config.data) {
      return { data: {} };
    }

    const data = JSON.parse(JSON.stringify(config.data));

    // Dynamic review aggregation for featuredProducts
    if (data.featuredProducts && Array.isArray(data.featuredProducts)) {
      const prodIds = data.featuredProducts.map((p: any) => p.id).filter(Boolean);
      if (prodIds.length > 0) {
        const reviews = await this.prisma.review.findMany({
          where: { productId: { in: prodIds } },
        });
        const reviewMap: Record<string, { total: number; count: number }> = {};
        reviews.forEach((r) => {
          if (!reviewMap[r.productId]) reviewMap[r.productId] = { total: 0, count: 0 };
          reviewMap[r.productId].total += r.rating;
          reviewMap[r.productId].count += 1;
        });

        data.featuredProducts = data.featuredProducts.map((p: any) => {
          const stats = reviewMap[p.id];
          const reviewsCount = stats ? stats.count : 0;
          const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
          return {
            ...p,
            rating,
            reviewsCount,
          };
        });
      }
    }

    // Dynamic review aggregation for intemporelIcons
    if (data.intemporelIcons && Array.isArray(data.intemporelIcons)) {
      const prodIds = data.intemporelIcons.map((p: any) => p.id).filter(Boolean);
      if (prodIds.length > 0) {
        const reviews = await this.prisma.review.findMany({
          where: { productId: { in: prodIds } },
        });
        const reviewMap: Record<string, { total: number; count: number }> = {};
        reviews.forEach((r) => {
          if (!reviewMap[r.productId]) reviewMap[r.productId] = { total: 0, count: 0 };
          reviewMap[r.productId].total += r.rating;
          reviewMap[r.productId].count += 1;
        });

        data.intemporelIcons = data.intemporelIcons.map((p: any) => {
          const stats = reviewMap[p.id];
          const reviewsCount = stats ? stats.count : 0;
          const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
          return {
            ...p,
            rating,
            reviewsCount,
          };
        });
      }
    }

    // Dynamic review aggregation for trustedShops
    if (data.trustedShops && Array.isArray(data.trustedShops)) {
      const shopIds = data.trustedShops.map((s: any) => s.id).filter(Boolean);
      if (shopIds.length > 0) {
        const reviews = await this.prisma.review.findMany({
          where: { shopId: { in: shopIds } },
        });
        const shopReviewMap: Record<string, { total: number; count: number }> = {};
        reviews.forEach((r) => {
          if (!shopReviewMap[r.shopId]) shopReviewMap[r.shopId] = { total: 0, count: 0 };
          shopReviewMap[r.shopId].total += r.rating;
          shopReviewMap[r.shopId].count += 1;
        });

        data.trustedShops = data.trustedShops.map((s: any) => {
          const stats = shopReviewMap[s.id];
          const reviewsCount = stats ? stats.count : 0;
          const rating = stats && stats.count > 0 ? Number((stats.total / stats.count).toFixed(1)) : null;
          return {
            ...s,
            rating,
            reviews: reviewsCount,
          };
        });
      } else {
        data.trustedShops = data.trustedShops.map((s: any) => ({
          ...s,
          rating: null,
          reviews: 0,
        }));
      }
    }

    return { ...config, data };
  }

  async updateLandingConfig(data: any, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Access denied');
    }

    const config = await this.prisma.platformConfig.upsert({
      where: { id: 'cms_main' },
      update: { data },
      create: { id: 'cms_main', data },
    });
    return config;
  }
}