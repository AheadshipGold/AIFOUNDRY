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
  // Deny-by-default: never fall back to an arbitrary shop for anonymous callers
  return null;
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

const CHANNEL_ACCOUNT: Record<string, { num: string; lib: string }> = {
  MTN_MOMO: { num: '512100', lib: 'MTN Mobile Money' },
  MOOV_MONEY: { num: '512200', lib: 'Moov Money' },
  CELTIIS_CASH: { num: '512300', lib: 'Celtiis Cash' },
  CARD: { num: '512400', lib: 'Carte bancaire' },
  DIRECT_TRANSFER: { num: '512000', lib: 'Banque' },
  CASH_ON_DELIVERY: { num: '530000', lib: 'Caisse especes' },
  PICKUP: { num: '530000', lib: 'Caisse especes' },
};

async function loadExportEntries(shopId?: string, userId?: string) {
  const targetShopId = await resolveShopId(shopId, userId);
  if (!targetShopId) throw new Error('Boutique introuvable pour cet export');
  return prisma.cashbookEntry.findMany({
    where: { shopId: targetShopId },
    orderBy: { entryDate: 'asc' },
  });
}

export async function exportFec(shopId?: string, userId?: string) {
  const entries = await loadExportEntries(shopId, userId);
  const now = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `FEC_${now}.txt`;
  const header = 'JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|PieceRef|EcritureLib|Debit|Credit';
  const lines: string[] = [header];
  entries.forEach((e, idx) => {
    const num = String(idx + 1);
    const date = e.entryDate.toISOString().split('T')[0].replace(/-/g, '');
    const amount = (e.amountMinor / 100).toFixed(2).replace('.', ',');
    const treasury = CHANNEL_ACCOUNT[e.channel] || { num: '530000', lib: 'Caisse' };
    const ref = (e.reference || `ECR-${num}`).replace(/\|/g, ' ');
    const lib = (e.notes || 'Ecriture de caisse').replace(/\|/g, ' ').replace(/\n/g, ' ');
    if (e.type === 'DECAISSEMENT') {
      lines.push(`CA|Caisse|${num}|${date}|607000|Achats|${ref}|${lib}|${amount}|0,00`);
      lines.push(`CA|Caisse|${num}|${date}|${treasury.num}|${treasury.lib}|${ref}|${lib}|0,00|${amount}`);
    } else {
      lines.push(`CA|Caisse|${num}|${date}|${treasury.num}|${treasury.lib}|${ref}|${lib}|${amount}|0,00`);
      lines.push(`CA|Caisse|${num}|${date}|707000|Ventes de marchandises|${ref}|${lib}|0,00|${amount}`);
    }
  });
  return { filename, content: lines.join('\n') + '\n', mimeType: 'text/plain;charset=utf-8', count: entries.length };
}

export async function exportCsv(shopId?: string, userId?: string) {
  const entries = await loadExportEntries(shopId, userId);
  const now = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `Livre_Caisse_${now}.csv`;
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = ['Date,Heure,Type,Canal,Reference,Libelle,MontantMinor,Devise'];
  for (const e of entries) {
    rows.push([
      e.entryDate.toISOString().split('T')[0],
      e.entryDate.toISOString().split('T')[1].slice(0, 5),
      e.type,
      e.channel,
      escape(e.reference || ''),
      escape(e.notes || ''),
      String(e.amountMinor),
      e.currency,
    ].join(','));
  }
  return { filename, content: rows.join('\n') + '\n', mimeType: 'text/csv;charset=utf-8', count: entries.length };
}
