import { Controller, Post, Get, Param, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/better-auth';

@Controller('v1/favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
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

  @Post(':productId/toggle')
  async toggleFavorite(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Veuillez vous connecter pour enregistrer vos favoris.');
    }
    return this.favoritesService.toggleFavorite(userId, productId);
  }

  @Get('my-ids')
  async getMyFavoriteIds(
    @Req() req: Request,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    if (!userId) {
      return [];
    }
    return this.favoritesService.getUserFavoriteIds(userId);
  }

  @Get()
  async getMyFavorites(
    @Req() req: Request,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    if (!userId) {
      throw new UnauthorizedException('Veuillez vous connecter pour accéder à votre liste d’envies.');
    }
    return this.favoritesService.getUserFavorites(userId);
  }

  @Get(':productId/count')
  async getFavoritesCount(@Param('productId') productId: string) {
    const count = await this.favoritesService.getProductFavoritesCount(productId);
    return { productId, count };
  }
}
