import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateReviewDto {
  productId: string;
  rating: number; // 1 to 5
  title?: string;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a buyer has purchased and paid for this product (Golden Rule: Verified Purchase)
   */
  async verifyPurchase(userId: string, productId: string): Promise<string | null> {
    // Find confirmed/delivered order for this buyer that contains this product in lines
    const confirmedOrder = await this.prisma.order.findFirst({
      where: {
        buyerId: userId,
        paymentStatus: { in: ['CONFIRMED', 'PARTIALLY_PAID'] },
        lines: {
          some: {
            variant: {
              productId: productId,
            },
          },
        },
      },
      select: { id: true },
    });

    return confirmedOrder ? confirmedOrder.id : null;
  }

  async checkUserCanReview(userId: string, productId: string) {
    const existing = await this.prisma.review.findUnique({
      where: {
        buyerId_productId: {
          buyerId: userId,
          productId: productId,
        },
      },
    });

    const orderId = await this.verifyPurchase(userId, productId);

    return {
      canReview: !!orderId && !existing,
      hasPurchased: !!orderId,
      existingReview: existing,
    };
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    if (!dto.rating || dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('La note doit être comprise entre 1 et 5 étoiles.');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, shopId: true },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable.');
    }

    // Strict Amazon/Airbnb Golden Rule: Only verified purchasers can review
    const verifiedOrderId = await this.verifyPurchase(userId, dto.productId);
    if (!verifiedOrderId) {
      throw new ForbiddenException(
        "Seuls les clients ayant acheté et payé ce produit peuvent déposer un avis vérifié."
      );
    }

    // Check if user already reviewed this product
    const existing = await this.prisma.review.findUnique({
      where: {
        buyerId_productId: {
          buyerId: userId,
          productId: dto.productId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Vous avez déjà déposé un avis pour cette création.');
    }

    return this.prisma.review.create({
      data: {
        buyerId: userId,
        productId: dto.productId,
        shopId: product.shopId,
        orderId: verifiedOrderId,
        rating: Math.round(dto.rating),
        title: dto.title?.trim() || null,
        comment: dto.comment?.trim() || null,
        isVerified: true,
      },
      include: {
        buyer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async getProductReviews(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    const reviewsCount = reviews.length;
    const averageRating =
      reviewsCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
        : null;

    return {
      averageRating,
      reviewsCount,
      reviews,
    };
  }

  async getShopReviews(shopId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        product: {
          select: { id: true, title: true, images: true },
        },
      },
    });

    const reviewsCount = reviews.length;
    const shopRating =
      reviewsCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
        : null;

    return {
      shopRating,
      reviewsCount,
      reviews,
    };
  }
}
