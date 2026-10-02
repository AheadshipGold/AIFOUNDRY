// Ojarket Offline-First Sync Manager
// Stores operations locally when offline and syncs when connectivity resumes

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

const OFFLINE_QUEUE_KEY = 'ojarket.offline.queue';

export interface OfflineOperation {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  createdAt: string;
  retries: number;
}

// Check network connectivity by pinging the API health endpoint
async function isOnline(): Promise<boolean> {
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

// Load queued operations from local storage
async function loadQueue(): Promise<OfflineOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save queue to local storage
async function saveQueue(queue: OfflineOperation[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue)).catch(() => {});
}

// Add an operation to the offline queue
export async function enqueueOfflineOperation(
  endpoint: string,
  method: string,
  body: any
): Promise<void> {
  const queue = await loadQueue();
  const op: OfflineOperation = {
    id: `offline_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    endpoint,
    method,
    body,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  queue.push(op);
  await saveQueue(queue);
  console.log(`[OFFLINE] Operation queued: ${method} ${endpoint} (Queue size: ${queue.length})`);
}

// Get current queue size
export async function getQueueSize(): Promise<number> {
  const queue = await loadQueue();
  return queue.length;
}

// Attempt to sync all queued operations
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number; remaining: number }> {
  const online = await isOnline();
  if (!online) {
    const queue = await loadQueue();
    return { synced: 0, failed: 0, remaining: queue.length };
  }

  const queue = await loadQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  console.log(`[OFFLINE] Attempting to sync ${queue.length} queued operations...`);

  let synced = 0;
  let failed = 0;
  const remaining: OfflineOperation[] = [];

  for (const op of queue) {
    try {
      const res = await fetch(`${API_BASE_URL}${op.endpoint}`, {
        method: op.method,
        headers: { 'Content-Type': 'application/json' },
        body: op.body ? JSON.stringify(op.body) : undefined,
      });

      if (res.ok) {
        synced++;
        console.log(`[OFFLINE] ✓ Synced: ${op.method} ${op.endpoint}`);
      } else if (res.status >= 400 && res.status < 500) {
        // Client error: don't retry (data issue)
        failed++;
        console.warn(`[OFFLINE] ✗ Permanently failed (${res.status}): ${op.method} ${op.endpoint}`);
      } else {
        // Server error: retry later
        op.retries++;
        if (op.retries < 5) {
          remaining.push(op);
        } else {
          failed++;
          console.warn(`[OFFLINE] ✗ Max retries reached: ${op.method} ${op.endpoint}`);
        }
      }
    } catch {
      // Network error during sync: keep in queue
      op.retries++;
      remaining.push(op);
    }
  }

  await saveQueue(remaining);
  console.log(`[OFFLINE] Sync complete: ${synced} synced, ${failed} failed, ${remaining.length} remaining`);

  return { synced, failed, remaining: remaining.length };
}

// Start a periodic sync interval (call on app startup)
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startPeriodicSync(intervalMs: number = 30000): void {
  if (syncInterval) return;
  
  syncInterval = setInterval(async () => {
    const size = await getQueueSize();
    if (size > 0) {
      await syncOfflineQueue();
    }
  }, intervalMs);
  
  console.log(`[OFFLINE] Periodic sync started (every ${intervalMs / 1000}s)`);
}

export function stopPeriodicSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[OFFLINE] Periodic sync stopped');
  }
}
