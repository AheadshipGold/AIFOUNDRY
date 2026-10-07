import { Controller, Get, Patch, Post, Param, Req, Headers } from '@nestjs/common';
import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/better-auth';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('v1/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getNotifications(
    @Req() req: Request,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    return this.notificationsService.getUserNotifications(userId || undefined);
  }

  @Get('unread-count')
  async getUnreadCount(
    @Req() req: Request,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    return this.notificationsService.getUnreadCount(userId || undefined);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read')
  async markAllAsRead(
    @Req() req: Request,
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ) {
    const userId = await this.extractUserId(req, authHeader, explicitUserId);
    return this.notificationsService.markAllAsRead(userId || undefined);
  }

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
      // ignore
    }

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const session = await this.prisma.session.findUnique({
          where: { token },
          include: { user: true },
        });
        if (session && session.expiresAt > new Date()) {
          return session.userId;
        }
      }
    }

    return null;
  }
}
