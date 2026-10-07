import { Controller, Post, Get, Body, Param, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ReviewsService, CreateReviewDto } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/better-auth';

@Controller('v1/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly prisma: PrismaService,
  ) {}

  private async extractUserId(req: Request, authHeader?: string, explicitUserId?: string): Promise<string | null> {
    if (explicitUserId) return explicitUserId;

    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (session?.user?.id) {
        return session.user.id;
      }
    } catch {
      // Fallback
    }

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const dbSession = await this.prisma.session.findUnique({
          where: { token },
          select: { userId: true, expiresAt: true },
        });
        if (dbSession && dbSession.expiresAt > new Date()) {
          return dbSession.userId;
        }

        const directUser = await this.prisma.user.findUnique({
          where: { id: token },
          select: { id: true },
        });
        if (directUser) return directUser.id;
      }
    }

    return null;
  }

  @Post()
  async createReview(
    @Req() req: Request,
    @Body() dto: CreateReviewDto,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Veuillez vous connecter pour déposer un avis.');
    }
    return this.reviewsService.createReview(userId, dto);
  }

  @Get('product/:productId')
  async getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  @Get('shop/:shopId')
  async getShopReviews(@Param('shopId') shopId: string) {
    return this.reviewsService.getShopReviews(shopId);
  }

  @Get('can-review/:productId')
  async canReview(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    if (!userId) {
      return { canReview: false, hasPurchased: false, existingReview: null };
    }
    return this.reviewsService.checkUserCanReview(userId, productId);
  }
}
