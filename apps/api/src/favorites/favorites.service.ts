import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFavorite(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable.');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      const count = await this.prisma.favorite.count({ where: { productId } });
      return { isFavorite: false, productId, totalFavorites: count };
    } else {
      await this.prisma.favorite.create({
        data: {
          userId,
          productId,
        },
      });
      const count = await this.prisma.favorite.count({ where: { productId } });
      return { isFavorite: true, productId, totalFavorites: count };
    }
  }

  async getUserFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    return favorites.map((f) => f.productId);
  }

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            shop: true,
            variants: true,
          },
        },
      },
    });

    return favorites.map((f) => {
      const p = f.product;
      const priceMinor = p.variants.length > 0 ? p.variants[0].priceMinor : 0;
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        image: p.images.length > 0 ? p.images[0] : '',
        priceMinor,
        currency: 'XOF',
        price: Math.round(priceMinor / 100),
        artisanShop: {
          id: p.shop.id,
          name: p.shop.name,
          city: p.shop.city,
          country: p.shop.country,
          verified: p.shop.isVerified,
        },
        favoritedAt: f.createdAt,
      };
    });
  }

  async getProductFavoritesCount(productId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { productId },
    });
  }
}
