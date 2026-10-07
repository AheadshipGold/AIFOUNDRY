import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER_UPDATE' | 'PROPOSAL_RECEIVED' | 'BESPOKE_MATCH' | 'FINOPS_ALERT' | 'REVIEW_RECEIVED';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  private inMemoryReadStatus: Set<string> = new Set();

  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userId?: string): Promise<AppNotification[]> {
    if (!userId) {
      return [];
    }

    const notifications: AppNotification[] = [];

    // 1. Check user orders for status updates
    const userOrders = await this.prisma.order.findMany({
      where: { buyerId: userId },
      include: { shop: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    for (const order of userOrders) {
      if (order.fulfillmentStatus === 'DELIVERED') {
        const notifId = `notif-order-del-${order.id}`;
        notifications.push({
          id: notifId,
          title: `Commande livrée · ${order.orderNumber}`,
          message: `Votre commande auprès de ${order.shop.name} a été livrée avec succès. Vous pouvez déposer un avis vérifié.`,
          type: 'ORDER_UPDATE',
          isRead: this.inMemoryReadStatus.has(notifId),
          link: `/purchases?orderId=${order.id}`,
          createdAt: order.updatedAt.toISOString(),
        });
      } else if (order.paymentStatus === 'CONFIRMED') {
        const notifId = `notif-order-pay-${order.id}`;
        notifications.push({
          id: notifId,
          title: `Paiement confirmé · ${order.orderNumber}`,
          message: `Le règlement de ${order.orderNumber} a été confirmé. La boutique prépare votre expédition.`,
          type: 'ORDER_UPDATE',
          isRead: this.inMemoryReadStatus.has(notifId),
          link: `/purchases?orderId=${order.id}`,
          createdAt: order.updatedAt.toISOString(),
        });
      }
    }

    // 2. Check proposals on buyer requests
    const userRequests = await this.prisma.purchaseRequest.findMany({
      where: { buyerId: userId },
      include: {
        proposals: {
          include: { shop: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      take: 10,
    });

    for (const req of userRequests) {
      for (const prop of req.proposals) {
        const notifId = `notif-prop-${prop.id}`;
        notifications.push({
          id: notifId,
          title: `Proposition reçue pour "${req.title}"`,
          message: `${prop.shop.name} a soumis un devis de ${(prop.priceMinor / 100).toLocaleString('fr-FR')} ${prop.currency} (délai : ${prop.productionDays} jours).`,
          type: 'PROPOSAL_RECEIVED',
          isRead: this.inMemoryReadStatus.has(notifId),
          link: `/bespoke?requestId=${req.id}`,
          createdAt: prop.createdAt.toISOString(),
        });
      }
    }

    // 3. Check seller shops notifications (if user is shop owner)
    const ownedShops = await this.prisma.shop.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { memberships: { some: { userId } } },
        ],
      },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    for (const shop of ownedShops) {
      for (const ord of shop.orders) {
        const notifId = `notif-seller-ord-${ord.id}`;
        notifications.push({
          id: notifId,
          title: `Nouvelle commande boutique · ${ord.orderNumber}`,
          message: `Une nouvelle commande de ${(ord.totalAmountMinor / 100).toLocaleString('fr-FR')} ${ord.currency} a été passée sur ${shop.name}.`,
          type: 'ORDER_UPDATE',
          isRead: this.inMemoryReadStatus.has(notifId),
          link: `/seller/orders?orderId=${ord.id}`,
          createdAt: ord.createdAt.toISOString(),
        });
      }
    }

    // Sort all by timestamp descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return notifications;
  }

  async getUnreadCount(userId?: string): Promise<{ count: number }> {
    const list = await this.getUserNotifications(userId);
    const unread = list.filter((n) => !n.isRead);
    return { count: unread.length };
  }

  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    this.inMemoryReadStatus.add(notificationId);
    return { success: true };
  }

  async markAllAsRead(userId?: string): Promise<{ success: boolean }> {
    const list = await this.getUserNotifications(userId);
    for (const n of list) {
      this.inMemoryReadStatus.add(n.id);
    }
    return { success: true };
  }
}
