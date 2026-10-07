// Ojarket Advanced Bidirectional Offline-First Sync Engine (Handoff V3 / PRD 0.8)
// Handles local queue persistence (LOCAL_PENDING_SYNC), server batch reconciliation,
// explicit stock conflict detection, and idempotent resolution.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

const OFFLINE_QUEUE_KEY = 'ojarket.offline.queue.v2';
const OFFLINE_CONFLICTS_KEY = 'ojarket.offline.conflicts.v2';

export type SyncActionType = 'RECORD_EXTERNAL_SALE' | 'UPDATE_STOCK' | 'CREATE_DRAFT_PRODUCT';

export interface OfflineSyncItem {
  clientId: string; // Idempotent Client UUID
  action: SyncActionType;
  shopId: string;
  productId?: string;
  variantId?: string;
  quantity?: number;
  amountMinor?: number;
  paymentChannel?: 'ESPECES' | 'MTN_MOMO' | 'MOOV_MONEY' | 'CARTE_BANCAIRE' | 'AUTRE';
  clientTimestamp: string;
  clientVersion?: number;
  metadata?: Record<string, any>;
  status: 'LOCAL_PENDING_SYNC' | 'SYNCED' | 'CONFLICT' | 'FAILED';
  retries: number;
  errorMessage?: string;
}

export interface SyncConflict {
  conflictId: string;
  clientId: string;
  shopId: string;
  action: string;
  reason: 'INSUFFICIENT_STOCK' | 'VERSION_MISMATCH' | 'PRODUCT_NOT_FOUND';
  serverStockOnHand: number;
  requestedQuantity: number;
  productTitle: string;
  variantName?: string;
  createdAt: string;
  status: 'PENDING_RESOLVE' | 'RESOLVED_OVERRIDE' | 'RESOLVED_CANCELLED';
}

export interface SyncEngineStatus {
  isOnline: boolean;
  pendingCount: number;
  conflictCount: number;
  lastSyncAt: string | null;
}

// Listeners pour notifier les composants UI lors des changements d'état
type SyncListener = (status: SyncEngineStatus) => void;
const listeners = new Set<SyncListener>();

function notifyListeners(status: SyncEngineStatus) {
  listeners.forEach((fn) => {
    try {
      fn(status);
    } catch {
      // ignore
    }
  });
}

export function subscribeSyncStatus(fn: SyncListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let lastSuccessfulSyncTimestamp: string | null = null;

// Vérifier la connectivité réseau
export async function isNetworkOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/products?limit=1`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Charger la file d'attente locale
export async function loadSyncQueue(): Promise<OfflineSyncItem[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveSyncQueue(queue: OfflineSyncItem[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue)).catch(() => {});
}

// Charger les conflits locaux
export async function loadSyncConflicts(): Promise<SyncConflict[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_CONFLICTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveSyncConflicts(conflicts: SyncConflict[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_CONFLICTS_KEY, JSON.stringify(conflicts)).catch(() => {});
}

// Ajouter une vente externe physique dans la file hors-ligne
export async function enqueueOfflineSale(params: {
  shopId: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  quantity: number;
  amountMinor: number;
  paymentChannel?: 'ESPECES' | 'MTN_MOMO' | 'MOOV_MONEY' | 'CARTE_BANCAIRE' | 'AUTRE';
}): Promise<OfflineSyncItem> {
  const queue = await loadSyncQueue();
  const clientId = `ext_sale_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const item: OfflineSyncItem = {
    clientId,
    action: 'RECORD_EXTERNAL_SALE',
    shopId: params.shopId,
    productId: params.productId,
    variantId: params.variantId,
    quantity: params.quantity,
    amountMinor: params.amountMinor,
    paymentChannel: params.paymentChannel || 'ESPECES',
    clientTimestamp: new Date().toISOString(),
    status: 'LOCAL_PENDING_SYNC',
    retries: 0,
    metadata: {
      productTitle: params.productTitle,
    },
  };

  queue.push(item);
  await saveSyncQueue(queue);

  console.log(`[OFFLINE SYNC] Vente externe en file d'attente (LOCAL_PENDING_SYNC) : ${clientId}`);
  await updateStatus();

  return item;
}

// Ajouter une mise à jour d'inventaire physique dans la file hors-ligne
export async function enqueueStockUpdate(params: {
  shopId: string;
  variantId: string;
  productTitle: string;
  newStockOnHand: number;
}): Promise<OfflineSyncItem> {
  const queue = await loadSyncQueue();
  const clientId = `stock_adj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const item: OfflineSyncItem = {
    clientId,
    action: 'UPDATE_STOCK',
    shopId: params.shopId,
    variantId: params.variantId,
    quantity: params.newStockOnHand,
    clientTimestamp: new Date().toISOString(),
    status: 'LOCAL_PENDING_SYNC',
    retries: 0,
    metadata: {
      productTitle: params.productTitle,
    },
  };

  queue.push(item);
  await saveSyncQueue(queue);
  await updateStatus();

  return item;
}

// Obtenir le statut global du moteur de synchronisation
export async function getSyncEngineStatus(): Promise<SyncEngineStatus> {
  const online = await isNetworkOnline();
  const queue = await loadSyncQueue();
  const conflicts = await loadSyncConflicts();

  return {
    isOnline: online,
    pendingCount: queue.filter((i) => i.status === 'LOCAL_PENDING_SYNC').length,
    conflictCount: conflicts.filter((c) => c.status === 'PENDING_RESOLVE').length,
    lastSyncAt: lastSuccessfulSyncTimestamp,
  };
}

async function updateStatus() {
  const status = await getSyncEngineStatus();
  notifyListeners(status);
}

// Réconciliation en lot avec le serveur NestJS (/v1/sync/reconcile)
export async function reconcileOfflineBatch(shopId?: string): Promise<{
  syncedCount: number;
  conflictCount: number;
  remainingPending: number;
}> {
  const online = await isNetworkOnline();
  if (!online) {
    const queue = await loadSyncQueue();
    return { syncedCount: 0, conflictCount: 0, remainingPending: queue.length };
  }

  const queue = await loadSyncQueue();
  const pendingItems = queue.filter((i) => i.status === 'LOCAL_PENDING_SYNC');

  if (pendingItems.length === 0) {
    return { syncedCount: 0, conflictCount: 0, remainingPending: 0 };
  }

  console.log(`[OFFLINE SYNC] Envoi du lot de synchronisation (${pendingItems.length} opérations)...`);

  try {
    const res = await fetch(`${API_BASE_URL}/v1/sync/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId,
        items: pendingItems.map((item) => ({
          clientId: item.clientId,
          action: item.action,
          shopId: item.shopId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          amountMinor: item.amountMinor,
          paymentChannel: item.paymentChannel,
          clientTimestamp: item.clientTimestamp,
          metadata: item.metadata,
        })),
      }),
    });

    if (!res.ok) {
      console.warn(`[OFFLINE SYNC] Erreur réponse serveur (${res.status})`);
      return { syncedCount: 0, conflictCount: 0, remainingPending: pendingItems.length };
    }

    const data = await res.json();
    const currentConflicts = await loadSyncConflicts();
    const remainingQueue: OfflineSyncItem[] = [];

    // Traitement des résultats retournés par le serveur
    for (const item of pendingItems) {
      const result = data.results?.find((r: any) => r.clientId === item.clientId);

      if (result) {
        if (result.status === 'SYNCED' || result.status === 'DUPLICATE') {
          // Succès : retiré de la file
          console.log(`[OFFLINE SYNC] ✓ Synchronisé : ${item.clientId}`);
        } else if (result.status === 'CONFLICT' && result.conflict) {
          // Conflit : enregistré dans la liste des conflits pour arbitrage vendeur
          console.warn(`[OFFLINE SYNC] ⚠️ Conflit détecté : ${item.clientId} (${result.message})`);
          currentConflicts.push(result.conflict);
        } else {
          item.retries++;
          item.errorMessage = result.message;
          if (item.retries < 5) remainingQueue.push(item);
        }
      } else {
        remainingQueue.push(item);
      }
    }

    await saveSyncQueue(remainingQueue);
    await saveSyncConflicts(currentConflicts);

    lastSuccessfulSyncTimestamp = new Date().toISOString();
    await updateStatus();

    return {
      syncedCount: data.syncedCount || 0,
      conflictCount: data.conflictCount || 0,
      remainingPending: remainingQueue.length,
    };
  } catch (err: any) {
    console.error(`[OFFLINE SYNC] Échec réseau lors de la réconciliation:`, err);
    return { syncedCount: 0, conflictCount: 0, remainingPending: pendingItems.length };
  }
}

// Résolution explicite d'un conflit par le commerçant
export async function resolveOfflineConflict(
  conflictId: string,
  strategy: 'FORCE_STOCK_OVERRIDE' | 'CANCEL_LOCAL_OPERATION',
  auditReason?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/sync/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy,
        auditReason: auditReason || 'Résolution mobile explicite',
      }),
    });

    if (res.ok) {
      const conflicts = await loadSyncConflicts();
      const updated = conflicts.map((c) =>
        c.conflictId === conflictId
          ? { ...c, status: strategy === 'FORCE_STOCK_OVERRIDE' ? 'RESOLVED_OVERRIDE' as const : 'RESOLVED_CANCELLED' as const }
          : c
      );
      await saveSyncConflicts(updated.filter((c) => c.status === 'PENDING_RESOLVE'));
      await updateStatus();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Démarrage de la boucle périodique de réconciliation
let syncTimer: ReturnType<typeof setInterval> | null = null;

export function startPeriodicSync(shopId?: string, intervalMs: number = 20000): void {
  if (syncTimer) return;

  syncTimer = setInterval(async () => {
    const queue = await loadSyncQueue();
    if (queue.length > 0) {
      const targetShopId = shopId || queue[0]?.shopId || 'default-shop';
      await reconcileOfflineBatch(targetShopId);
    }
  }, intervalMs);

  console.log(`[OFFLINE SYNC] Moteur périodique activé (intervalle: ${intervalMs / 1000}s)`);
}

export function stopPeriodicSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log('[OFFLINE SYNC] Moteur périodique arrêté');
  }
}
