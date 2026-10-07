import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceMinor: number;
  stockOnHand: number;
  stockReserved: number;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  artisanShop: {
    id: string;
    name: string;
    city: string;
    country: string;
    verified: boolean;
  };
  priceMinor: number;
  currency: string;
  stockOnHand: number;
  image: string;
  tags: string[];
  materials: string[];
  variants: ProductVariant[];
  rating: number | null;
  reviewsCount: number;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToProductItem(product: any): ProductItem {
    const variants: ProductVariant[] = product.variants.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      priceMinor: v.priceMinor,
      stockOnHand: v.stockOnHand,
      stockReserved: v.stockReserved,
    }));

    const stockOnHand = variants.reduce((acc, v) => acc + v.stockOnHand, 0);
    const priceMinor = variants.length > 0 ? variants[0].priceMinor : 0;
    const currency = variants.length > 0 ? product.variants[0].currency : 'XOF';

    const reviews = product.reviews || [];
    const reviewsCount = reviews.length;
    const rating =
      reviewsCount > 0
        ? Number((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount).toFixed(1))
        : null;

    return {
      id: product.id,
      title: product.title,
      description: product.description || '',
      category: product.category,
      artisanShop: {
        id: product.shop.id,
        name: product.shop.name,
        city: product.shop.city,
        country: product.shop.country,
        verified: product.shop.isVerified,
      },
      priceMinor,
      currency,
      stockOnHand,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      tags: [],
      materials: [],
      variants,
      rating,
      reviewsCount,
    };
  }

  async findAll(query?: string, category?: string, shopId?: string): Promise<ProductItem[]> {
    const where: any = {};

    if (shopId) {
      where.shopId = shopId;
    } else {
      where.shop = {
        isVerified: true,
        kycStatus: 'VERIFIED',
      };
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { shop: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        shop: true,
        variants: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(p => this.mapToProductItem(p));
  }

  async findById(id: string): Promise<ProductItem> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
        variants: true,
        reviews: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.mapToProductItem(product);
  }

  async createProduct(dto: {
    shopId: string;
    title: string;
    description?: string;
    category?: string;
    priceMinor: number;
    stockOnHand?: number;
    originCity?: string;
    images?: string[];
  }): Promise<ProductItem> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
    });

    if (!shop) {
      throw new NotFoundException(`Shop ${dto.shopId} not found`);
    }

    const skuCode = `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const product = await this.prisma.product.create({
      data: {
        shopId: dto.shopId,
        title: dto.title,
        description: dto.description || '',
        category: dto.category || 'leather',
        originCity: dto.originCity || shop.city || 'Cotonou',
        isPublished: true,
        images: dto.images && dto.images.length > 0 ? dto.images : [],
        variants: {
          create: {
            sku: skuCode,
            name: dto.title,
            priceMinor: dto.priceMinor,
            currency: shop.currency || 'XOF',
            stockOnHand: dto.stockOnHand ?? 1,
            stockReserved: 0,
            isAvailable: true,
          },
        },
      },
      include: {
        shop: true,
        variants: true,
        reviews: true,
      },
    });

    return this.mapToProductItem(product);
  }

  async reserveVariantStock(variantId: string, qty: number): Promise<boolean> {
    const variant = await this.prisma.offerVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return false;
    }

    const availableStock = variant.stockOnHand - variant.stockReserved;
    if (availableStock < qty) {
      return false;
    }

    // Atomic update using optimistic concurrency control
    const result = await this.prisma.offerVariant.updateMany({
      where: {
        id: variantId,
        stockOnHand: variant.stockOnHand,
        stockReserved: variant.stockReserved,
      },
      data: {
        stockReserved: {
          increment: qty,
        },
      },
    });

    return result.count > 0;
  }

  async getShopBySlug(slug: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isPublished: true },
          include: {
            shop: true,
            variants: true,
            reviews: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            buyer: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException(`Boutique avec le slug "${slug}" introuvable.`);
    }

    const reviewsCount = shop.reviews.length;
    const averageRating =
      reviewsCount > 0
        ? Number((shop.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
        : null;

    return {
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      description: shop.description || '',
      craftType: shop.craftType || 'Boutique Spécialisée',
      city: shop.city,
      country: shop.country,
      currency: shop.currency,
      isVerified: shop.isVerified,
      kycStatus: shop.kycStatus,
      storefrontTheme: shop.storefrontTheme,
      bannerUrl: shop.bannerUrl,
      customLayout: shop.customLayout,
      rating: averageRating,
      reviewsCount,
      products: shop.products.map((p) => this.mapToProductItem(p)),
      reviews: shop.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        buyerName: r.buyer?.name || 'Client Vérifié',
      })),
      createdAt: shop.createdAt.toISOString(),
    };
  }
}
