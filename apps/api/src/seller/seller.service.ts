import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentChannel, EntryType, FinancialEventType, VerificationSource } from '@prisma/client';

export interface FinOpsEntry {
  id: string;
  type: 'ENCAISSEMENT' | 'DECAISSEMENT' | 'VENTE_A_CREDIT';
  label: string;
  channel: 'MTN MoMo' | 'Moov Money' | 'Celtiis Cash' | 'Espèces' | 'Virement';
  amountMinor: number;
  currency: string;
  reference: string;
  time: string;
  source: 'SELLER_MANUAL' | 'PROVIDER' | 'COD';
}

export interface FinancialEventRecord {
  id: string;
  shopId: string;
  eventType: string;
  amountMinor: number;
  currency: string;
  channel: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface DayClosureRecord {
  id: string;
  date: string;
  totalVenduMinor: number;
  totalEncaisseMinor: number;
  totalRestantMinor: number;
  varianceMinor: number;
  status: 'EQUILIBRE' | 'ECART_SIGNALE';
  breakdown: {
    mtnMomoMinor: number;
    moovMoneyMinor: number;
    celtiisCashMinor: number;
    cashMinor: number;
    virementMinor: number;
  };
  closedBy: string;
  auditNotes?: string;
  closedAt: string;
}

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  private mapChannelToDisplay(channel: PaymentChannel | string): 'MTN MoMo' | 'Moov Money' | 'Celtiis Cash' | 'Espèces' | 'Virement' {
    switch (channel) {
      case 'MTN_MOMO': return 'MTN MoMo';
      case 'MOOV_MONEY': return 'Moov Money';
      case 'CELTIIS_CASH': return 'Celtiis Cash';
      case 'CASH_ON_DELIVERY':
      case 'PICKUP':
        return 'Espèces';
      case 'DIRECT_TRANSFER': return 'Virement';
      default: return 'Espèces';
    }
  }

  private mapDisplayToChannel(display: string): PaymentChannel {
    switch (display) {
      case 'MTN MoMo': return 'MTN_MOMO' as PaymentChannel;
      case 'Moov Money': return 'MOOV_MONEY' as PaymentChannel;
      case 'Celtiis Cash': return 'CELTIIS_CASH' as PaymentChannel;
      case 'Espèces': return 'CASH_ON_DELIVERY' as PaymentChannel;
      case 'Virement': return 'DIRECT_TRANSFER' as PaymentChannel;
      default: return 'CASH_ON_DELIVERY' as PaymentChannel;
    }
  }

  private async resolveShopId(shopId?: string, userId?: string): Promise<string | null> {
    if (shopId) {
      const exists = await this.prisma.shop.findUnique({ where: { id: shopId } });
      if (exists) return exists.id;
    }
    if (userId) {
      const userShop = await this.prisma.shop.findFirst({
        where: {
          OR: [
            { ownerId: userId },
            { memberships: { some: { userId } } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
      if (userShop) return userShop.id;
    }
    // If no shop found for specific user/shop, return null
    if (userId || shopId) {
      return null;
    }
    // Fallback only if general request with no identity
    const firstShop = await this.prisma.shop.findFirst({ orderBy: { createdAt: 'asc' } });
    return firstShop ? firstShop.id : null;
  }

  async getDashboardMetrics(shopId?: string, userId?: string) {
    const targetShopId = await this.resolveShopId(shopId, userId);

    if (!targetShopId) {
      return {
        kpis: [
          { label: 'Ventes du jour', value: '0', unit: 'XOF' },
          { label: 'Commandes', value: '0' },
          { label: 'Alertes stock', value: '0' }
        ],
        priorities: [
          { text: 'Atelier prêt · Ajoutez votre première création', action: 'Ajouter', type: 'info' },
          { text: 'Validation KYC en cours d’examen', action: 'Vérifier', type: 'info' }
        ]
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cashbookEntries = await this.prisma.cashbookEntry.findMany({
      where: {
        shopId: targetShopId,
        entryDate: { gte: today }
      }
    });

    let todaySalesMinor = 0;
    for (const entry of cashbookEntries) {
      if (entry.type === 'ENCAISSEMENT') {
        todaySalesMinor += entry.amountMinor;
      }
    }

    const todayOrdersCount = await this.prisma.order.count({
      where: {
        shopId: targetShopId,
        createdAt: { gte: today }
      }
    });

    const lowStockCount = await this.prisma.offerVariant.count({
      where: {
        product: { shopId: targetShopId },
        stockOnHand: { lte: 2 }
      }
    });

    return {
      kpis: [
        { label: 'Ventes du jour', value: (todaySalesMinor / 100).toString(), unit: 'XOF' },
        { label: 'Commandes', value: todayOrdersCount.toString() },
        { label: 'Alertes stock', value: lowStockCount.toString() }
      ],
      priorities: [
        { text: lowStockCount > 0 ? `${lowStockCount} articles en rupture imminente` : 'Stock à jour', action: 'Gérer', type: lowStockCount > 0 ? 'warning' : 'info' },
        { text: 'Clôture de caisse quotidienne', action: 'Clôturer', type: 'info' }
      ]
    };
  }

  async getCashbook(shopId?: string, userId?: string) {
    const targetShopId = await this.resolveShopId(shopId, userId);

    if (!targetShopId) {
      return {
        summary: {
          totalVenduMinor: 0,
          totalEncaisseMinor: 0,
          totalRestantMinor: 0
        },
        recentEntries: [],
        history: [],
        eventHistory: []
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = await this.prisma.cashbookEntry.findMany({
      where: { shopId: targetShopId, entryDate: { gte: today } },
      orderBy: { entryDate: 'desc' }
    });

    const closures = await this.prisma.dayClosure.findMany({
      where: { shopId: targetShopId },
      orderBy: { closureDate: 'desc' },
      take: 5
    });

    const events = await this.prisma.financialEvent.findMany({
      where: { shopId: targetShopId, createdAt: { gte: today } },
      orderBy: { createdAt: 'desc' }
    });

    const recentEntries: FinOpsEntry[] = entries.map(e => ({
      id: e.id,
      type: e.type as any,
      label: e.notes || 'Entrée manuelle',
      channel: this.mapChannelToDisplay(e.channel),
      amountMinor: e.amountMinor,
      currency: 'XOF',
      reference: e.reference || '',
      time: e.entryDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      source: 'SELLER_MANUAL'
    }));

    const eventHistory: FinancialEventRecord[] = events.map(e => ({
      id: e.id,
      shopId: e.shopId,
      eventType: e.eventType,
      amountMinor: e.amountMinor,
      currency: e.currency,
      channel: e.channel,
      reference: e.reference || undefined,
      notes: e.notes || undefined,
      createdAt: e.createdAt.toISOString()
    }));

    const history: DayClosureRecord[] = closures.map(c => ({
      id: c.id,
      date: c.closureDate.toISOString().split('T')[0],
      totalVenduMinor: c.totalVenduMinor,
      totalEncaisseMinor: c.totalEncaisseMinor,
      totalRestantMinor: c.totalRestantMinor,
      varianceMinor: c.varianceMinor,
      status: c.status as any,
      breakdown: c.breakdown as any || { mtnMomoMinor: 0, moovMoneyMinor: 0, celtiisCashMinor: 0, cashMinor: 0, virementMinor: 0 },
      closedBy: c.closedBy,
      auditNotes: c.auditNotes || undefined,
      closedAt: c.closedAt.toISOString()
    }));

    let totalEncaisseMinor = 0;
    entries.forEach(e => {
      if (e.type === 'ENCAISSEMENT') totalEncaisseMinor += e.amountMinor;
      if (e.type === 'DECAISSEMENT') totalEncaisseMinor -= e.amountMinor;
    });

    const summary = {
      totalVenduMinor: totalEncaisseMinor,
      totalEncaisseMinor,
      totalRestantMinor: 0
    };

    return {
      summary,
      recentEntries,
      history,
      eventHistory
    };
  }

  async recordCollection(dto: any, userId?: string) {
    const { shopId, amountMinor, channel, reference, notes, currency = 'XOF', orderId } = dto;
    const targetShopId = await this.resolveShopId(shopId, userId);
    if (!targetShopId) throw new NotFoundException('Atelier introuvable pour enregistrer cet encaissement');

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.cashbookEntry.create({
        data: {
          shopId: targetShopId,
          type: 'ENCAISSEMENT',
          amountMinor,
          channel: this.mapDisplayToChannel(channel),
          reference: reference || '',
          notes: notes || ''
        }
      });

      const event = await tx.financialEvent.create({
        data: {
          shopId: targetShopId,
          orderId: orderId || undefined,
          eventType: 'PAYMENT_CONFIRMED',
          amountMinor,
          currency,
          source: 'SELLER_MANUAL',
          channel: this.mapDisplayToChannel(channel),
          reference: reference || '',
          notes: notes || 'Enregistrement manuel'
        }
      });

      return { entry, event };
    });
  }

  async closeDay(dto: any, userId?: string) {
    const { shopId, physicalCashMinor = 0, closedBy, notes } = dto;
    const targetShopId = await this.resolveShopId(shopId, userId);
    if (!targetShopId) throw new NotFoundException('Atelier introuvable pour effectuer la clôture');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.$transaction(async (tx) => {
      const entries = await tx.cashbookEntry.findMany({
        where: { shopId: targetShopId, entryDate: { gte: today } }
      });

      let totalEncaisseMinor = 0;
      const breakdown = {
        mtnMomoMinor: 0,
        moovMoneyMinor: 0,
        celtiisCashMinor: 0,
        cashMinor: 0,
        virementMinor: 0
      };

      for (const e of entries) {
        if (e.type === 'ENCAISSEMENT') {
          totalEncaisseMinor += e.amountMinor;
          const displayChannel = this.mapChannelToDisplay(e.channel);
          if (displayChannel === 'MTN MoMo') breakdown.mtnMomoMinor += e.amountMinor;
          if (displayChannel === 'Moov Money') breakdown.moovMoneyMinor += e.amountMinor;
          if (displayChannel === 'Celtiis Cash') breakdown.celtiisCashMinor += e.amountMinor;
          if (displayChannel === 'Espèces') breakdown.cashMinor += e.amountMinor;
          if (displayChannel === 'Virement') breakdown.virementMinor += e.amountMinor;
        } else if (e.type === 'DECAISSEMENT') {
          totalEncaisseMinor -= e.amountMinor;
          const displayChannel = this.mapChannelToDisplay(e.channel);
          if (displayChannel === 'MTN MoMo') breakdown.mtnMomoMinor -= e.amountMinor;
          if (displayChannel === 'Moov Money') breakdown.moovMoneyMinor -= e.amountMinor;
          if (displayChannel === 'Celtiis Cash') breakdown.celtiisCashMinor -= e.amountMinor;
          if (displayChannel === 'Espèces') breakdown.cashMinor -= e.amountMinor;
          if (displayChannel === 'Virement') breakdown.virementMinor -= e.amountMinor;
        }
      }

      const varianceMinor = physicalCashMinor - breakdown.cashMinor;
      const status = varianceMinor === 0 ? 'EQUILIBRE' : 'ECART_SIGNALE';

      const closureDate = new Date();
      closureDate.setUTCHours(0,0,0,0);

      const closure = await tx.dayClosure.upsert({
        where: {
          shopId_closureDate: {
            shopId: targetShopId,
            closureDate: closureDate
          }
        },
        create: {
          shopId: targetShopId,
          closureDate,
          totalVenduMinor: totalEncaisseMinor,
          totalEncaisseMinor,
          totalRestantMinor: 0,
          varianceMinor,
          status,
          breakdown,
          closedBy: closedBy || 'System',
          auditNotes: notes
        },
        update: {
          totalVenduMinor: totalEncaisseMinor,
          totalEncaisseMinor,
          totalRestantMinor: 0,
          varianceMinor,
          status,
          breakdown,
          closedBy: closedBy || 'System',
          auditNotes: notes
        }
      });

      await tx.financialEvent.create({
        data: {
          shopId: targetShopId,
          eventType: 'DAY_CLOSED',
          amountMinor: totalEncaisseMinor,
          currency: 'XOF',
          source: 'SELLER_MANUAL',
          channel: 'CASH_ON_DELIVERY',
          notes: notes || 'Clôture de journée'
        }
      });

      return closure;
    });
  }
}
