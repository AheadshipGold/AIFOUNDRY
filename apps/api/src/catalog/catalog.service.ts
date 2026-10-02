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
    };
  }

  async findAll(query?: string, category?: string): Promise<ProductItem[]> {
    const where: any = {
      shop: {
        isVerified: true,
        kycStatus: 'VERIFIED',
      },
    };

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
      },
    });

    return products.map(p => this.mapToProductItem(p));
  }

  async findById(id: string): Promise<ProductItem> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

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
}
