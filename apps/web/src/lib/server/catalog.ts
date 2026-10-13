import { prisma } from './prisma';

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
  images?: string[];
  isPublished?: boolean;
  originCity?: string;
  tags: string[];
  materials: string[];
  variants: ProductVariant[];
  rating: number | null;
  reviewsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

function mapToProductItem(product: any): ProductItem {
  const variants: ProductVariant[] = (product.variants || []).map((v: any) => ({
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
      id: product.shop?.id || '',
      name: product.shop?.name || 'Boutique Officielle',
      city: product.shop?.city || 'Cotonou',
      country: product.shop?.country || 'Bénin',
      verified: product.shop?.isVerified || false,
    },
    priceMinor,
    currency,
    stockOnHand,
    image: product.images && product.images.length > 0 ? product.images[0] : '',
    images: product.images || [],
    isPublished: product.isPublished ?? true,
    originCity: product.originCity || 'Cotonou',
    tags: [],
    materials: [],
    variants,
    rating,
    reviewsCount,
    createdAt: product.createdAt?.toISOString?.() || product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() || product.updatedAt,
  };
}

export async function getProducts(query?: string, category?: string, shopId?: string): Promise<ProductItem[]> {
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

  const products = await prisma.product.findMany({
    where,
    include: {
      shop: true,
      variants: true,
      reviews: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((p) => mapToProductItem(p));
}

export async function getProductById(id: string): Promise<ProductItem> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      shop: true,
      variants: true,
      reviews: true,
    },
  });

  if (!product) {
    throw new Error(`Produit ${id} introuvable`);
  }

  return mapToProductItem(product);
}

export async function createProduct(dto: {
  shopId: string;
  title: string;
  description?: string;
  category?: string;
  priceMinor: number;
  stockOnHand?: number;
  originCity?: string;
  images?: string[];
}): Promise<ProductItem> {
  const shop = await prisma.shop.findUnique({
    where: { id: dto.shopId },
  });

  if (!shop) {
    throw new Error(`Boutique ${dto.shopId} introuvable`);
  }

  const skuCode = `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const product = await prisma.product.create({
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

  return mapToProductItem(product);
}

export async function reserveVariantStock(variantId: string, qty: number): Promise<boolean> {
  const variant = await prisma.offerVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) return false;

  const availableStock = variant.stockOnHand - variant.stockReserved;
  if (availableStock < qty) return false;

  const result = await prisma.offerVariant.updateMany({
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

export async function getShopBySlug(identifier: string) {
  if (!identifier) {
    throw new Error('Identifiant ou slug de boutique manquant.');
  }

  const shop = await prisma.shop.findFirst({
    where: {
      OR: [
        { slug: identifier },
        { id: identifier },
      ],
    },
    include: {
      owner: {
        select: {
          phone: true,
          phoneNumber: true,
        },
      },
      paymentConnections: {
        where: { isActive: true },
        select: {
          merchantPhone: true,
          merchantNumber: true,
          channel: true,
        },
      },
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
    throw new Error(`Boutique "${identifier}" introuvable.`);
  }

  const reviewsCount = shop.reviews.length;
  const averageRating =
    reviewsCount > 0
      ? Number((shop.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
      : null;

  // Resolve official dynamic contact phone for WhatsApp / Direct inquiry
  const directPhone =
    shop.paymentConnections.find((p) => p.merchantPhone?.trim())?.merchantPhone?.trim() ||
    shop.owner?.phone?.trim() ||
    shop.owner?.phoneNumber?.trim() ||
    null;

  return {
    id: shop.id,
    slug: shop.slug,
    name: shop.name,
    description: shop.description || '',
    craftType: shop.craftType || 'Boutique Spécialisée',
    city: shop.city,
    country: shop.country,
    currency: shop.currency,
    phone: directPhone,
    isVerified: shop.isVerified,
    kycStatus: shop.kycStatus,
    storefrontTheme: shop.storefrontTheme,
    bannerUrl: shop.bannerUrl,
    customLayout: shop.customLayout,
    rating: averageRating,
    reviewsCount,
    products: shop.products.map((p) => mapToProductItem(p)),
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

export async function getSellerCatalog(shopId: string): Promise<ProductItem[]> {
  const products = await prisma.product.findMany({
    where: { shopId },
    include: {
      shop: true,
      variants: {
        include: {
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      },
      reviews: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((p) => mapToProductItem(p));
}

export async function getSellerProductById(id: string, shopId: string): Promise<ProductItem> {
  const product = await prisma.product.findFirst({
    where: { id, shopId },
    include: {
      shop: true,
      variants: true,
      reviews: true,
    },
  });

  if (!product) {
    throw new Error(`Produit introuvable dans cette boutique`);
  }

  return mapToProductItem(product);
}

export async function updateSellerProduct(
  id: string,
  shopId: string,
  dto: {
    title?: string;
    description?: string;
    category?: string;
    originCity?: string;
    isPublished?: boolean;
    images?: string[];
    priceMinor?: number;
    stockOnHand?: number;
  }
): Promise<ProductItem> {
  const existing = await prisma.product.findFirst({
    where: { id, shopId },
    include: { variants: true },
  });

  if (!existing) {
    throw new Error(`Produit introuvable ou vous n’avez pas les droits dessus`);
  }

  const updateData: any = {};
  if (dto.title !== undefined) updateData.title = dto.title;
  if (dto.description !== undefined) updateData.description = dto.description;
  if (dto.category !== undefined) updateData.category = dto.category;
  if (dto.originCity !== undefined) updateData.originCity = dto.originCity;
  if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;
  if (dto.images !== undefined) updateData.images = dto.images;

  if (existing.variants.length > 0 && (dto.priceMinor !== undefined || dto.stockOnHand !== undefined)) {
    const primaryVariant = existing.variants[0];
    const variantUpdate: any = {};
    if (dto.priceMinor !== undefined) variantUpdate.priceMinor = dto.priceMinor;
    if (dto.stockOnHand !== undefined) {
      const delta = dto.stockOnHand - primaryVariant.stockOnHand;
      variantUpdate.stockOnHand = dto.stockOnHand;

      if (delta !== 0) {
        await prisma.stockMovement.create({
          data: {
            variantId: primaryVariant.id,
            delta,
            reason: 'INVENTORY_ADJUSTMENT',
            reference: `Mise à jour manuelle stock vendeur (${delta > 0 ? '+' : ''}${delta})`,
          },
        });
      }
    }

    if (Object.keys(variantUpdate).length > 0) {
      await prisma.offerVariant.update({
        where: { id: primaryVariant.id },
        data: variantUpdate,
      });
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      shop: true,
      variants: true,
      reviews: true,
    },
  });

  return mapToProductItem(updated);
}

export async function deleteSellerProduct(id: string, shopId: string): Promise<boolean> {
  const existing = await prisma.product.findFirst({
    where: { id, shopId },
  });

  if (!existing) {
    throw new Error(`Produit introuvable dans cette boutique`);
  }

  await prisma.product.delete({
    where: { id },
  });

  return true;
}
