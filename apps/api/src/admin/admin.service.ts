import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const totalShops = await this.prisma.shop.count();
    const verifiedShops = await this.prisma.shop.count({ where: { isVerified: true } });
    const totalOrders = await this.prisma.order.count();
    const totalVolume = await this.prisma.order.aggregate({
      _sum: { grossSaleAmountMinor: true },
    });
    const activeCorridors = await this.prisma.paymentCorridorRule.count({
      where: { isEnabled: true },
    });
    const openRequests = await this.prisma.purchaseRequest.count({
      where: { status: 'OPEN' },
    });

    return {
      kpis: {
        totalShops,
        verifiedShops,
        pendingKycShops: totalShops - verifiedShops,
        totalOrders,
        totalVolumeMinor: totalVolume._sum.grossSaleAmountMinor || 0,
        activeCorridors,
        openRequests,
      },
    };
  }

  async getShops(query?: string) {
    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { craftType: { contains: query, mode: 'insensitive' } },
      ];
    }

    const shops = await this.prisma.shop.findMany({
      where,
      include: {
        owner: true,
        _count: {
          select: { products: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return shops.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      craftType: s.craftType || 'Artisanat',
      city: s.city,
      country: s.country,
      isVerified: s.isVerified,
      status: s.isVerified ? 'VERIFIED' : 'PENDING_KYC',
      ownerName: s.owner?.name || 'Inconnu',
      ownerEmail: s.owner?.email || '',
      productsCount: s._count.products,
      ordersCount: s._count.orders,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async updateShopVerification(
    shopId: string,
    isVerified: boolean,
    adminEmail = 'admin@ojarket.bj',
    ipAddress = '127.0.0.1'
  ) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException(`Shop ${shopId} not found`);

    let admin = await this.prisma.adminUser.findFirst({
      where: { email: adminEmail },
    });

    if (!admin) {
      admin = await this.prisma.adminUser.create({
        data: {
          email: adminEmail,
          name: 'Super Admin Plateforme',
          role: 'PLATFORM_OWNER',
          mfaEnabled: true,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const kycStatus = isVerified ? 'VERIFIED' : 'SUSPENDED';
      const updatedShop = await tx.shop.update({
        where: { id: shopId },
        data: { 
          isVerified,
          kycStatus,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: isVerified ? 'SHOP_VERIFIED' : 'SHOP_SUSPENDED',
          targetResource: 'Shop',
          targetId: shopId,
          beforeState: { isVerified: shop.isVerified, kycStatus: shop.kycStatus },
          afterState: { isVerified, kycStatus },
          ipAddress,
        },
      });

      return updatedShop;
    });
  }

  async getCorridors() {
    let corridors = await this.prisma.paymentCorridorRule.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // If empty, initialize standard Benin corridors
    if (corridors.length === 0) {
      await this.prisma.paymentCorridorRule.createMany({
        data: [
          {
            countryCode: 'BJ',
            currency: 'XOF',
            channel: 'MTN_MOMO',
            isEnabled: true,
            denyByDefault: true,
            requiredKycLevel: 'STANDARD',
            minAmountMinor: 10000,
            maxAmountMinor: 500000000,
          },
          {
            countryCode: 'BJ',
            currency: 'XOF',
            channel: 'MOOV_MONEY',
            isEnabled: true,
            denyByDefault: true,
            requiredKycLevel: 'STANDARD',
            minAmountMinor: 10000,
            maxAmountMinor: 500000000,
          },
          {
            countryCode: 'BJ',
            currency: 'XOF',
            channel: 'CELTIIS_CASH',
            isEnabled: true,
            denyByDefault: true,
            requiredKycLevel: 'STANDARD',
            minAmountMinor: 10000,
            maxAmountMinor: 200000000,
          },
          {
            countryCode: 'BJ',
            currency: 'XOF',
            channel: 'CASH_ON_DELIVERY',
            isEnabled: true,
            denyByDefault: true,
            requiredKycLevel: 'TIER_1',
            minAmountMinor: 50000,
            maxAmountMinor: 50000000,
          },
          {
            countryCode: 'BJ',
            currency: 'XOF',
            channel: 'DIRECT_TRANSFER',
            isEnabled: true,
            denyByDefault: true,
            requiredKycLevel: 'ENHANCED',
            minAmountMinor: 5000000,
            maxAmountMinor: 1000000000,
          },
        ],
      });

      corridors = await this.prisma.paymentCorridorRule.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    return corridors;
  }

  async toggleCorridor(
    id: string,
    isEnabled: boolean,
    adminEmail = 'admin@ojarket.bj',
    ipAddress = '127.0.0.1'
  ) {
    const rule = await this.prisma.paymentCorridorRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException(`Corridor rule ${id} not found`);

    let admin = await this.prisma.adminUser.findFirst({
      where: { email: adminEmail },
    });

    if (!admin) {
      admin = await this.prisma.adminUser.create({
        data: {
          email: adminEmail,
          name: 'Super Admin Plateforme',
          role: 'PLATFORM_OWNER',
          mfaEnabled: true,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.paymentCorridorRule.update({
        where: { id },
        data: { isEnabled },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: isEnabled ? 'CORRIDOR_ENABLED' : 'CORRIDOR_DISABLED',
          targetResource: 'PaymentCorridorRule',
          targetId: id,
          beforeState: { isEnabled: rule.isEnabled },
          afterState: { isEnabled },
          ipAddress,
        },
      });

      return updated;
    });
  }

  async getAuditLogs() {
    const logs = await this.prisma.adminAuditLog.findMany({
      include: { admin: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      targetResource: l.targetResource,
      targetId: l.targetId,
      adminName: l.admin?.name || 'Système',
      adminRole: l.admin?.role || 'OPERATIONS_ADMIN',
      ipAddress: l.ipAddress || '127.0.0.1',
      beforeState: l.beforeState,
      afterState: l.afterState,
      createdAt: l.createdAt.toISOString(),
    }));
  }


  async getAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, createdAt: true, isActive: true }
    });
  }

  async createAdmin(email, name) {
    const existing = await this.prisma.user.findFirst({ where: { email } });
    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN' }
      });
    }
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    return this.prisma.user.create({
      data: {
        email,
        name,
        username,
        displayUsername: username,
        role: 'ADMIN',
        isEmailVerified: true
      }
    });
  }

}
