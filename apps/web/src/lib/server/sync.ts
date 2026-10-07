import { prisma } from './prisma';

export interface SyncItemDto {
  clientId: string;
  action: 'RECORD_EXTERNAL_SALE' | 'UPDATE_STOCK' | 'CREATE_DRAFT_PRODUCT';
  shopId: string;
  productId?: string;
  variantId?: string;
  quantity?: number;
  amountMinor?: number;
  paymentChannel?: string;
  clientTimestamp: string;
}

export async function pullSyncChanges(userId: string, since?: string) {
  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: userId }, { memberships: { some: { userId } } }] },
  });

  if (!shop) return { products: [], orders: [], pulledAt: new Date().toISOString(), since: new Date().toISOString() };

  const sinceDate = since ? new Date(since) : new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const products = await prisma.product.findMany({
    where: { shopId: shop.id, updatedAt: { gte: sinceDate } },
    include: { variants: true },
  });

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id, updatedAt: { gte: sinceDate } },
    include: { lines: true },
  });

  return {
    products,
    orders,
    pulledAt: new Date().toISOString(),
  };
}

export async function pushSyncMutations(userId: string, mutations: SyncItemDto[]) {
  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: userId }, { memberships: { some: { userId } } }] },
  });

  const shopId = shop?.id || (mutations[0]?.shopId || '');
  return reconcileSyncBatch(shopId, mutations);
}

export async function reconcileSyncBatch(shopId: string, items: SyncItemDto[]) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { success: true, totalProcessed: 0, syncedCount: 0, conflictCount: 0, results: [], conflicts: [] };
  }

  const results: any[] = [];
  const conflicts: any[] = [];

  for (const item of items) {
    try {
      const existingMovement = await prisma.stockMovement.findFirst({
        where: { reference: 'OFFLINE_SYNC:' + item.clientId },
        include: { variant: true },
      });

      if (existingMovement) {
        results.push({
          clientId: item.clientId,
          status: 'DUPLICATE',
          message: 'Opération déjà synchronisée.',
          updatedStock: existingMovement.variant.stockOnHand,
        });
        continue;
      }

      if (item.action === 'RECORD_EXTERNAL_SALE') {
        const qty = Math.max(1, item.quantity || 1);
        let variant = item.variantId
          ? await prisma.offerVariant.findUnique({ where: { id: item.variantId }, include: { product: true } })
          : null;

        if (!variant && item.productId) {
          variant = await prisma.offerVariant.findFirst({ where: { productId: item.productId }, include: { product: true } });
        }

        if (!variant) {
          const conflict = {
            conflictId: 'conf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            clientId: item.clientId,
            shopId,
            action: item.action,
            reason: 'PRODUCT_NOT_FOUND',
            serverStockOnHand: 0,
            requestedQuantity: qty,
            productTitle: 'Article introuvable',
            createdAt: new Date().toISOString(),
            status: 'PENDING_RESOLVE',
          };
          conflicts.push(conflict);
          results.push({ clientId: item.clientId, status: 'CONFLICT', conflict });
          continue;
        }

        const available = variant.stockOnHand - variant.stockReserved;
        if (available < qty) {
          const conflict = {
            conflictId: 'conf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            clientId: item.clientId,
            shopId,
            action: item.action,
            reason: 'INSUFFICIENT_STOCK',
            serverStockOnHand: variant.stockOnHand,
            requestedQuantity: qty,
            productTitle: variant.product?.title || variant.name,
            variantName: variant.name,
            createdAt: new Date().toISOString(),
            status: 'PENDING_RESOLVE',
          };
          conflicts.push(conflict);
          results.push({ clientId: item.clientId, status: 'CONFLICT', conflict });
          continue;
        }

        const updated = await prisma.offerVariant.update({
          where: { id: variant.id },
          data: { stockOnHand: { decrement: qty } },
        });

        await prisma.stockMovement.create({
          data: {
            variantId: variant.id,
            delta: -qty,
            reason: 'SALE',
            reference: 'OFFLINE_SYNC:' + item.clientId,
          },
        });

        results.push({ clientId: item.clientId, status: 'SYNCED', updatedStock: updated.stockOnHand });
      } else {
        results.push({ clientId: item.clientId, status: 'SYNCED' });
      }
    } catch (err: any) {
      results.push({ clientId: item.clientId, status: 'ERROR', message: err.message });
    }
  }

  const syncedCount = results.filter((r) => r.status === 'SYNCED' || r.status === 'DUPLICATE').length;
  return {
    success: true,
    totalProcessed: items.length,
    syncedCount,
    conflictCount: conflicts.length,
    results,
    conflicts,
  };
}
