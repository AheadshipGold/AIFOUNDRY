import { Body, Controller, Get, Param, Patch, Post, Query, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/better-auth';
import { OrdersService, OrderRecord } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('v1/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  private async extractUserId(
    req: Request,
    authHeader?: string,
    explicitUserId?: string,
  ): Promise<string | null> {
    if (explicitUserId) return explicitUserId;

    // 1. Better Auth session check
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (session?.user?.id) {
        return session.user.id;
      }
    } catch {
      // ignore
    }

    // 2. Direct database token lookup in Session table
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

        // 3. Fallback for custom formatted tokens
        if (token.startsWith('ojk_sess_')) {
          const withoutPrefix = token.substring('ojk_sess_'.length);
          const lastUnderscore = withoutPrefix.lastIndexOf('_');
          const possibleId = lastUnderscore > 0 ? withoutPrefix.substring(0, lastUnderscore) : withoutPrefix;
          const userExists = await this.prisma.user.findUnique({
            where: { id: possibleId },
            select: { id: true },
          });
          if (userExists) return userExists.id;
        }

        // 4. Direct user ID token for testing
        const directUser = await this.prisma.user.findUnique({
          where: { id: token },
          select: { id: true },
        });
        if (directUser) return directUser.id;
      }
    }

    return null;
  }

  @Get()
  async getAll(
    @Req() req: Request,
    @Query('shopId') shopId?: string,
    @Headers('authorization') authHeader?: string,
    @Headers('x-shop-id') headerShopId?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ): Promise<OrderRecord[]> {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    const targetShopId = headerShopId || shopId;
    return this.ordersService.findAll(targetShopId, userId || undefined);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<OrderRecord> {
    return this.ordersService.findById(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      buyerName: string;
      buyerPhone: string;
      deliveryAddress: string;
      paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY';
      items: Array<{ variantId: string; quantity: number }>;
    },
  ): Promise<OrderRecord> {
    return this.ordersService.createOrder(body);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      paymentStatus?: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED';
      fulfillmentStatus?: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
    },
  ): Promise<OrderRecord> {
    return this.ordersService.updateStatus(id, body);
  }
}

