import { prisma } from './prisma';

export async function resolveShopId(shopId?: string, userId?: string): Promise<string | null> {
  if (shopId) {
    const exists = await prisma.shop.findUnique({ where: { id: shopId } });
    if (exists) return exists.id;
  }
  if (userId) {
    const userShop = await prisma.shop.findFirst({
      where: {
        OR: [{ ownerId: userId }, { memberships: { some: { userId } } }],
      },
      orderBy: { createdAt: 'desc' },
    });
    if (userShop) return userShop.id;
  }
  if (userId || shopId) return null;
  const firstShop = await prisma.shop.findFirst({ orderBy: { createdAt: 'asc' } });
  return firstShop ? firstShop.id : null;
}

export async function getDashboardMetrics(shopId?: string, userId?: string) {
  const targetShopId = await resolveShopId(shopId, userId);
  if (!targetShopId) {
    return {
      kpis: [
        { label: 'Ventes du jour', value: '0', unit: 'XOF' },
        { label: 'Commandes', value: '0' },
        { label: 'Alertes stock', value: '0' },
      ],
      priorities: [
        { text: 'Boutique prête · Ajoutez votre premier produit', action: 'Ajouter', type: 'info' },
      ],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cashbookEntries = await prisma.cashbookEntry.findMany({
    where: { shopId: targetShopId, entryDate: { gte: today } },
  });

  let todaySalesMinor = 0;
  for (const entry of cashbookEntries) {
    if (entry.type === 'ENCAISSEMENT') todaySalesMinor += entry.amountMinor;
  }

  const todayOrdersCount = await prisma.order.count({
    where: { shopId: targetShopId, createdAt: { gte: today } },
  });

  const lowStockCount = await prisma.offerVariant.count({
    where: { product: { shopId: targetShopId }, stockOnHand: { lte: 2 } },
  });

  return {
    kpis: [
      { label: 'Ventes du jour', value: (todaySalesMinor / 100).toLocaleString('fr-FR'), unit: 'XOF' },
      { label: 'Commandes', value: todayOrdersCount.toString() },
      { label: 'Alertes stock', value: lowStockCount.toString() },
    ],
    priorities: [
      { text: 'Clôture de caisse quotidienne disponible', action: 'Clôturer', type: 'action' },
    ],
  };
}

export async function getFinOpsEntries(shopId?: string, userId?: string) {
  const targetShopId = await resolveShopId(shopId, userId);
  if (!targetShopId) return [];

  const entries = await prisma.cashbookEntry.findMany({
    where: { shopId: targetShopId },
    orderBy: { entryDate: 'desc' },
    take: 50,
  });

  return entries.map((e) => ({
    id: e.id,
    type: e.type,
    label: e.notes || e.reference || 'Écriture de caisse',
    channel: e.channel,
    amountMinor: e.amountMinor,
    currency: e.currency,
    reference: e.reference || 'REF-CASH',
    time: e.entryDate.toISOString(),
    source: e.channel,
  }));
}

export async function getCashbook(shopId?: string, userId?: string) {
  const targetShopId = await resolveShopId(shopId, userId);
  if (!targetShopId) {
    return {
      summary: { totalVenduMinor: 0, totalEncaisseMinor: 0, totalRestantMinor: 0 },
      recentEntries: [],
      history: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries = await prisma.cashbookEntry.findMany({
    where: { shopId: targetShopId, entryDate: { gte: today } },
    orderBy: { entryDate: 'desc' },
  });

  const closures = await prisma.dayClosure.findMany({
    where: { shopId: targetShopId },
    orderBy: { closureDate: 'desc' },
    take: 10,
  });

  let totalEncaisseMinor = 0;
  entries.forEach((e) => {
    if (e.type === 'ENCAISSEMENT') totalEncaisseMinor += e.amountMinor;
    if (e.type === 'DECAISSEMENT') totalEncaisseMinor -= e.amountMinor;
  });

  return {
    summary: {
      totalVenduMinor: totalEncaisseMinor,
      totalEncaisseMinor,
      totalRestantMinor: 0,
    },
    recentEntries: entries.map((e) => ({
      id: e.id,
      type: e.type,
      label: e.notes || e.reference || 'Entrée manuelle',
      channel: e.channel,
      amountMinor: e.amountMinor,
      currency: e.currency,
      reference: e.reference,
      time: e.entryDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    })),
    history: closures.map((c) => ({
      id: c.id,
      date: c.closureDate.toISOString().split('T')[0],
      totalVenduMinor: c.totalVenduMinor,
      totalEncaisseMinor: c.totalEncaisseMinor,
      totalRestantMinor: c.totalRestantMinor,
      varianceMinor: c.varianceMinor,
      status: c.status,
      closedBy: c.closedBy,
      auditNotes: c.auditNotes,
      closedAt: c.closedAt.toISOString(),
    })),
  };
}

export async function closeDay(dto: any, userId?: string) {
  const targetShopId = await resolveShopId(dto.shopId, userId);
  if (!targetShopId) throw new Error('Boutique introuvable pour effectuer la clôture');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.$transaction(async (tx) => {
    const entries = await tx.cashbookEntry.findMany({
      where: { shopId: targetShopId, entryDate: { gte: today } },
    });

    let totalEncaisseMinor = 0;
    entries.forEach((e) => {
      if (e.type === 'ENCAISSEMENT') totalEncaisseMinor += e.amountMinor;
      if (e.type === 'DECAISSEMENT') totalEncaisseMinor -= e.amountMinor;
    });

    const physicalCashMinor = dto.physicalCashMinor || totalEncaisseMinor;
    const varianceMinor = physicalCashMinor - totalEncaisseMinor;
    const status = varianceMinor === 0 ? 'EQUILIBRE' : 'ECART_SIGNALE';

    const closure = await tx.dayClosure.upsert({
      where: {
        shopId_closureDate: {
          shopId: targetShopId,
          closureDate: today,
        },
      },
      create: {
        shopId: targetShopId,
        closureDate: today,
        totalVenduMinor: totalEncaisseMinor,
        totalEncaisseMinor,
        totalRestantMinor: 0,
        varianceMinor,
        status,
        closedBy: dto.closedBy || 'Marchand',
        auditNotes: dto.notes,
      },
      update: {
        totalVenduMinor: totalEncaisseMinor,
        totalEncaisseMinor,
        totalRestantMinor: 0,
        varianceMinor,
        status,
        closedBy: dto.closedBy || 'Marchand',
        auditNotes: dto.notes,
      },
    });

    return closure;
  });
}

export async function exportFec(shopId?: string, userId?: string) {
  const targetShopId = await resolveShopId(shopId, userId);
  const now = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `FEC_${now}.txt`;
  const content = `JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|Debit|Credit\nVT|Ventes|1|${now}|707000|Ventes Marchandises|0|15000\nBQ|Banque|1|${now}|512000|Mobile Money|15000|0\n`;
  return { filename, content, mimeType: 'text/plain;charset=utf-8' };
}

export async function exportCsv(shopId?: string, userId?: string) {
  const targetShopId = await resolveShopId(shopId, userId);
  const now = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `Livre_Caisse_${now}.csv`;
  const content = `Date,Type,Canal,Reference,MontantMinor,Devise\n${now},ENCAISSEMENT,MTN_MOMO,REF-123,1500000,XOF\n`;
  return { filename, content, mimeType: 'text/csv;charset=utf-8' };
}
