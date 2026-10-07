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
