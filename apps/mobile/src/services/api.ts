// Ojarket Mobile API Client
// Connects to local NestJS backend with intelligent offline fallback

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded to strictly use the .env variable, with automatic production fallback
const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://www.ojarket.com/api';

// All endpoints below are written as `/v1/...`. The env value may end with
// `/api` or `/api/v1`: strip a trailing `/v1` so we never call `/api/v1/v1/...`.
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '').replace(/\/v1$/, '');

// Dynamic local Wi-Fi IP auto-detected from Expo Metro
const METRO_HOST_IP =
  Constants.expoConfig?.hostUri?.split(':')[0] ||
  (Constants as any).manifest2?.extra?.expoClient?.hostUri?.split(':')[0] ||
  '10.201.5.162';
export const LAN_BASE_URL = `http://${METRO_HOST_IP}:3000/api`;

let _activeBaseUrl = API_BASE_URL;

/** Public origin of the web platform (used to resolve relative upload URLs). */
export const API_ORIGIN = _activeBaseUrl.replace(/\/api$/, '');

/** Resolves a possibly relative media URL (e.g. `/uploads/x.jpg` or `/api/v1/media/...`) to an absolute one, with auto-repair of legacy media paths. */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const origin = _activeBaseUrl.replace(/\/api$/, '');

  // Auto-repair any double-domain or unresolvable legacy media URLs
  if (url.includes('media.ojarket.com/')) {
    const pathPart = url.split('media.ojarket.com/')[1];
    return `${origin}/api/v1/media/${pathPart}`;
  }

  if (/^(https?:|data:|file:)/i.test(url)) return url;
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const customHeaders = (options?.headers as Record<string, string>) || {};
  
  // Bypass localtunnel warning page if using localtunnel
  customHeaders['Bypass-Tunnel-Reminder'] = 'true';

  let authHeader = customHeaders['Authorization'] || customHeaders['authorization'];

  if (!authHeader) {
    const token = await getValidAuthToken();
    if (token) {
      authHeader = `Bearer ${token}`;
    }
  }

  let explicitUserId = customHeaders['x-user-id'];
  if (!explicitUserId) {
    try {
      const raw = await AsyncStorage.getItem('ojarket.auth.session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user?.id) {
          explicitUserId = parsed.user.id;
        }
      }
    } catch {}
  }

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
    ...(authHeader ? { Authorization: authHeader } : {}),
    ...(explicitUserId ? { 'x-user-id': explicitUserId } : {}),
  };

  const executeFetch = async (baseUrl: string, timeoutMs = 5000): Promise<T> => {
    const url = `${baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers: finalHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errDetail = res.statusText;
        try {
          const errorJson = await res.json();
          if (errorJson && errorJson.message) {
            errDetail = Array.isArray(errorJson.message) ? errorJson.message.join(', ') : errorJson.message;
          }
        } catch {}
        throw new Error(errDetail || `Erreur API ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  // 1. Try active base URL first
  try {
    return await executeFetch(_activeBaseUrl, 30000);
  } catch (primaryErr) {
    // 2. Dual failover: If active URL fails, try alternate (LAN if tunnel failed, or tunnel if LAN failed)
    const alternateUrl = _activeBaseUrl === API_BASE_URL ? LAN_BASE_URL : API_BASE_URL;
    if (alternateUrl !== _activeBaseUrl) {
      try {
        const result = await executeFetch(alternateUrl, 20000);
        _activeBaseUrl = alternateUrl;
        return result;
      } catch {}
    }

    console.warn(`[API] Failed to fetch ${endpoint}:`, (primaryErr as Error).message);
    throw primaryErr;
  }
}

// ---------------------------------------------------------
// 1. CATALOGUE & PRODUITS (D01)
// ---------------------------------------------------------

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceMinor: number;
  stockOnHand: number;
  stockReserved: number;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  artisanShop: {
    id: string;
    name: string;
    city: string;
    country: string;
    verified: boolean;
  };
  priceMinor: number;
  currency: string;
  stockOnHand: number;
  image: string;
  tags: string[];
  materials: string[];
  variants: ProductVariant[];
}

export const CatalogApi = {
  async getProducts(query?: string, category?: string, shopId?: string): Promise<ProductItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);
    if (shopId) params.append('shopId', shopId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<ProductItem[]>(`/v1/products${queryString}`);
  },

  async getProduct(id: string): Promise<ProductItem> {
    return request<ProductItem>(`/v1/products/${id}`);
  },

  async getByShop(shopId: string): Promise<ProductItem[]> {
    return request<ProductItem[]>(`/v1/products?shopId=${encodeURIComponent(shopId)}`);
  },

  async createProduct(data: {
    shopId: string;
    title: string;
    description?: string;
    category?: string;
    priceMinor: number;
    stockOnHand?: number;
    originCity?: string;
    images?: string[];
  }): Promise<ProductItem> {
    return request<ProductItem>('/v1/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(),
    });
  },
};

// ---------------------------------------------------------
// 2. DEMANDES SUR-MESURE & DEVIS (D02)
// ---------------------------------------------------------

export interface StructuredAiExtraction {
  refinedTitle: string;
  category: string;
  materials: string[];
  estimatedDays: number;
  priceEstimateFCFA: number;
  deliveryEstimate?: string;
  targetBoutiques: string[];
  technicalSummary?: string;
}

export interface SellerProposalItem {
  id: string;
  requestId: string;
  shopId: string;
  shopName: string;
  artisanCity: string;
  priceMinor: number;
  advancePaymentRequiredMinor: number;
  currency: string;
  productionDays: number;
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  title: string;
  description: string;
  category: string;
  targetBudgetMinor?: number;
  currency: string;
  status: 'OPEN' | 'MATCHED' | 'FULFILLED' | 'CLOSED';
  aiAnalysis?: StructuredAiExtraction;
  proposals: SellerProposalItem[];
  createdAt: string;
}

export const RequestsApi = {
  async getAll(): Promise<PurchaseRequestItem[]> {
    return request<PurchaseRequestItem[]>('/v1/requests');
  },

  async getOne(id: string): Promise<PurchaseRequestItem> {
    return request<PurchaseRequestItem>(`/v1/requests/${id}`);
  },

  async analyzeWithAi(prompt: string): Promise<StructuredAiExtraction> {
    return request<StructuredAiExtraction>('/v1/requests/ai-analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  async create(data: {
    buyerId?: string;
    buyerName: string;
    buyerPhone?: string;
    rawPrompt: string;
    category?: string;
    budgetMinor?: number;
  }): Promise<PurchaseRequestItem> {
    return request<PurchaseRequestItem>('/v1/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async acceptProposal(requestId: string, proposalId: string) {
    return request<{ success: boolean; message: string; orderNumber: string }>(
      `/v1/requests/${requestId}/accept-proposal`,
      {
        method: 'POST',
        body: JSON.stringify({ proposalId }),
      }
    );
  },

  async submitProposal(
    requestId: string,
    data: {
      shopId?: string;
      shopName: string;
      artisanCity?: string;
      priceMinor: number;
      advancePaymentRequiredMinor?: number;
      productionDays: number;
      notes: string;
    }
  ): Promise<SellerProposalItem> {
    return request<SellerProposalItem>(`/v1/requests/${requestId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ---------------------------------------------------------
// 3. COMMANDES (ACHATS & VENDEUR)
// ---------------------------------------------------------

export interface OrderItemLine {
  variantId: string;
  productId?: string;
  itemTitle: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
  image?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  totalAmountMinor: number;
  currency: string;
  paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY' | string;
  paymentStatus: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED' | string;
  fulfillmentStatus: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | string;
  paymentInstructions?: {
    merchantAccount: string;
    merchantName: string;
    ussdCode?: string;
    reference: string;
  };
  lines: OrderItemLine[];
  createdAt: string;
}

export const OrdersApi = {
  async getAll(shopId?: string): Promise<OrderRecord[]> {
    const query = shopId ? `?shopId=${encodeURIComponent(shopId)}` : '';
    return request<OrderRecord[]>(`/v1/orders${query}`, {
      headers: authHeaders(),
    });
  },

  async getOne(id: string): Promise<OrderRecord> {
    return request<OrderRecord>(`/v1/orders/${id}`, {
      headers: authHeaders(),
    });
  },

  async create(order: {
    buyerName: string;
    buyerPhone: string;
    deliveryAddress: string;
    paymentChannel: string;
    items: Array<{ variantId: string; quantity: number; unitPriceMinor?: number; productId?: string }>;
  }): Promise<OrderRecord> {
    return request<OrderRecord>('/v1/orders', {
      method: 'POST',
      body: JSON.stringify(order),
      headers: authHeaders(),
    });
  },

  async updateStatus(
    id: string,
    updates: { paymentStatus?: string; fulfillmentStatus?: string }
  ): Promise<OrderRecord> {
    return request<OrderRecord>(`/v1/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: authHeaders(),
    });
  },

  async declarePayment(
    id: string,
    data: { transactionRef: string; notes?: string; proofUrl?: string }
  ): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/v1/orders/${id}/declare-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(),
    });
  },
};

// ---------------------------------------------------------
// 4. ESPACE VENDEUR & CAISSE FINOPS
// ---------------------------------------------------------

export interface FinOpsEntry {
  id: string;
  type: 'ENCAISSEMENT' | 'DECAISSEMENT' | 'VENTE_A_CREDIT' | string;
  label: string;
  /** Payment channel enum (MTN_MOMO, MOOV_MONEY, CELTIIS_CASH, CASH_ON_DELIVERY, ...) */
  channel: string;
  amountMinor: number;
  currency: string;
  reference: string;
  time: string;
}

export interface DayClosureRecord {
  id: string;
  date: string;
  totalVenduMinor: number;
  totalEncaisseMinor: number;
  totalRestantMinor: number;
  varianceMinor: number;
  status: 'EQUILIBRE' | 'ECART_SIGNALE' | 'BALANCED' | string;
  closedBy: string;
  auditNotes?: string;
  closedAt: string;
}

export interface CashbookData {
  summary: {
    totalVenduMinor: number;
    totalEncaisseMinor: number;
    totalRestantMinor: number;
  };
  recentEntries: FinOpsEntry[];
  history: DayClosureRecord[];
}

export interface SellerDashboardData {
  kpis: Array<{ label: string; value: string; unit?: string }>;
  priorities: Array<{ text: string; action: string; type: string }>;
}

export interface SellerOverview {
  shop: {
    id: string;
    slug: string;
    name: string;
    city: string;
    country: string;
    currency: string;
    isVerified: boolean;
    kycStatus: string;
  };
  roleInShop: string;
  revenue: {
    monthMinor: number;
    collectedMonthMinor: number;
    prevMonthMinor: number;
    growthPercent: number | null;
    cashTodayMinor: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    toFulfill: number;
    paymentPending: number;
    recent: OrderRecord[];
  };
  catalog: { total: number; published: number; drafts: number; lowStock: number; outOfStock: number };
  requests: { open: number };
  reviews: { count: number; rating: number | null };
  series: Array<{ date: string; amountMinor: number; count: number }>;
}

export interface SellerProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  priceMinor: number;
  currency: string;
  stockOnHand: number;
  image: string;
  images?: string[];
  isPublished?: boolean;
  rating: number | null;
  reviewsCount: number;
  variants: ProductVariant[];
  createdAt?: string;
}

export interface SellerShopDetails {
  id: string;
  slug: string;
  name: string;
  description: string;
  craftType: string;
  city: string;
  country: string;
  currency: string;
  isVerified: boolean;
  kycStatus: string;
  storefrontTheme: string;
  bannerUrl: string | null;
  counts: { products: number; orders: number; proposals: number; reviews: number };
}

export interface ShopPaymentConnection {
  channel: string;
  name: string;
  category: 'MOBILE_MONEY' | 'CASH' | 'BANK' | 'CARD';
  platformEnabled: boolean;
  shopEnabled: boolean;
  merchantPhone: string;
  merchantNumber: string;
  description: string;
}

export const SellerApi = {
  async getDashboard(): Promise<SellerDashboardData> {
    return request<SellerDashboardData>('/v1/seller/dashboard');
  },

  async getOverview(): Promise<SellerOverview> {
    return request<SellerOverview>('/v1/seller/overview');
  },

  /** Orders RECEIVED by the shop (sales) */
  async getOrders(): Promise<OrderRecord[]> {
    const res = await request<{ orders: OrderRecord[] }>('/v1/seller/orders');
    return res.orders || [];
  },

  async getShop(): Promise<SellerShopDetails> {
    const res = await request<{ shop: SellerShopDetails }>('/v1/seller/shop');
    return res.shop;
  },

  async updateShop(data: Partial<Pick<SellerShopDetails, 'name' | 'description' | 'city' | 'craftType' | 'storefrontTheme' | 'bannerUrl'>>): Promise<any> {
    return request('/v1/seller/shop', { method: 'PATCH', body: JSON.stringify(data) });
  },

  async getPaymentConnections(): Promise<ShopPaymentConnection[]> {
    const res = await request<{ connections: ShopPaymentConnection[] }>('/v1/seller/shop/payment-connections');
    return res.connections || [];
  },

  async updatePaymentConnections(
    connections: Array<{ channel: string; shopEnabled: boolean; merchantPhone?: string; merchantNumber?: string }>
  ): Promise<{ success: boolean; message: string }> {
    return request('/v1/seller/shop/payment-connections', {
      method: 'PATCH',
      body: JSON.stringify({ connections }),
    });
  },

  async getProducts(): Promise<SellerProduct[]> {
    const res = await request<{ products: SellerProduct[] }>('/v1/seller/products');
    return res.products || [];
  },

  async createProduct(data: {
    title: string;
    description?: string;
    category?: string;
    priceMinor: number;
    stockOnHand?: number;
    images?: string[];
  }): Promise<SellerProduct> {
    return request<SellerProduct>('/v1/seller/products', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateProduct(
    id: string,
    data: { title?: string; description?: string; isPublished?: boolean; priceMinor?: number; stockOnHand?: number; images?: string[] }
  ): Promise<SellerProduct> {
    return request<SellerProduct>(`/v1/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return request(`/v1/products/${id}`, { method: 'DELETE' });
  },

  /** Uploads a local image (file:// URI or base64) and returns its public URL */
  async uploadImage(localUri: string, mimeType?: string | null, base64Data?: string | null): Promise<string> {
    const token = await getValidAuthToken();
    let explicitUserId: string | undefined;
    try {
      const raw = await AsyncStorage.getItem('ojarket.auth.session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user?.id) explicitUserId = parsed.user.id;
      }
    } catch {}

    const ext = (localUri.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
    const resolvedMime = mimeType || (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');
    const filename = `photo-${Date.now()}.${ext === 'jpeg' ? 'jpg' : ext}`;

    const baseHeaders: Record<string, string> = {
      'Bypass-Tunnel-Reminder': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(explicitUserId ? { 'x-user-id': explicitUserId } : {}),
    };

    // Strategy 1: Direct JSON upload if base64 data was already provided (100% immune to multipart/FormData engine bugs)
    if (base64Data) {
      const doUploadJson = async (base: string) => {
        const res = await fetch(`${base}/v1/seller/uploads`, {
          method: 'POST',
          headers: {
            ...baseHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64: base64Data,
            filename,
            mimeType: resolvedMime,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.url) {
          throw new Error(json?.message || `Erreur de téléversement (${res.status})`);
        }
        return resolveMediaUrl(json.url) || json.url;
      };

      try {
        return await doUploadJson(_activeBaseUrl);
      } catch (primaryErr) {
        const alt = _activeBaseUrl === API_BASE_URL ? LAN_BASE_URL : API_BASE_URL;
        if (alt !== _activeBaseUrl) {
          try {
            return await doUploadJson(alt);
          } catch {}
        }
        throw primaryErr;
      }
    }

    // Strategy 2: Read blob from local URI and upload via FormData or Base64
    let blob: Blob | null = null;
    try {
      const localFileRes = await fetch(localUri);
      blob = await localFileRes.blob();
    } catch (e) {
      console.warn('Could not read local URI as blob directly:', e);
    }

    // Try standard FormData with real Blob (WinterCG compliant)
    if (blob) {
      try {
        const form = new FormData();
        form.append('file', blob, filename);

        const doUploadFormData = async (base: string) => {
          const res = await fetch(`${base}/v1/seller/uploads`, {
            method: 'POST',
            headers: baseHeaders,
            body: form,
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok || !json?.url) {
            throw new Error(json?.message || `Erreur de téléversement (${res.status})`);
          }
          return resolveMediaUrl(json.url) || json.url;
        };

        try {
          return await doUploadFormData(_activeBaseUrl);
        } catch (err) {
          const alt = _activeBaseUrl === API_BASE_URL ? LAN_BASE_URL : API_BASE_URL;
          if (alt !== _activeBaseUrl) {
            try {
              return await doUploadFormData(alt);
            } catch {}
          }
          throw err;
        }
      } catch (formErr: any) {
        console.warn('FormData upload failed, trying Base64 JSON fallback:', formErr?.message);
      }
    }

    // Strategy 3: Universal Base64 JSON fallback via FileReader
    try {
      let b64 = '';
      if (blob) {
        b64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.onerror = reject;
          reader.readAsDataURL(blob!);
        });
      } else {
        const fileRes = await fetch(localUri);
        const arrayBuf = await fileRes.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        b64 = `data:${resolvedMime};base64,${(globalThis as any).btoa ? (globalThis as any).btoa(binary) : ''}`;
      }

      if (!b64) {
        throw new Error('Impossible de lire les données binaires de l’image sélectionnée.');
      }

      const doUploadJson = async (base: string) => {
        const res = await fetch(`${base}/v1/seller/uploads`, {
          method: 'POST',
          headers: {
            ...baseHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64: b64,
            filename,
            mimeType: resolvedMime,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.url) {
          throw new Error(json?.message || `Erreur de téléversement (${res.status})`);
        }
        return resolveMediaUrl(json.url) || json.url;
      };

      try {
        return await doUploadJson(_activeBaseUrl);
      } catch (primaryErr) {
        const alt = _activeBaseUrl === API_BASE_URL ? LAN_BASE_URL : API_BASE_URL;
        if (alt !== _activeBaseUrl) {
          try {
            return await doUploadJson(alt);
          } catch {}
        }
        throw primaryErr;
      }
    } catch (finalErr: any) {
      throw new Error(finalErr?.message || 'Erreur lors du transfert de l’image.');
    }
  },

  async getCashbook(): Promise<CashbookData> {
    return request<CashbookData>('/v1/seller/cashbook');
  },

  async recordCollection(data: {
    label: string;
    amountMinor: number;
    channel: string;
    type?: 'ENCAISSEMENT' | 'DECAISSEMENT';
    reference?: string;
    notes?: string;
  }): Promise<any> {
    return request('/v1/seller/cashbook', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async closeDay(data: {
    physicalCashMinor: number;
    closedBy?: string;
    notes?: string;
  }): Promise<DayClosureRecord> {
    return request<DayClosureRecord>('/v1/seller/cashbook/close', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async exportFec(): Promise<{ filename: string; content: string; mimeType: string; count?: number }> {
    return request('/v1/seller/cashbook/export-fec', {
      headers: authHeaders(),
    });
  },

  async exportCsv(): Promise<{ filename: string; content: string; mimeType: string; count?: number }> {
    return request('/v1/seller/cashbook/export-csv', {
      headers: authHeaders(),
    });
  },
};


// ---------------------------------------------------------
// 5. AUTHENTIFICATION & SESSION
// ---------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  username?: string;
  avatarUrl?: string | null;
  city?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | 'OPERATOR';
  locale: string;
  shops: AuthShop[];
  activeShop: AuthShop | null;
  /** Legacy singular field still returned by the backend */
  shop?: AuthShop | null;
}

export interface AuthShop {
  id: string;
  slug: string;
  name: string;
  craftType: string;
  city: string;
  country: string;
  currency: string;
  isVerified: boolean;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  productsCount: number;
  ordersCount: number;
  role: string;
  bannerUrl?: string | null;
}

/**
 * Normalizes any backend user payload into the mobile contract:
 * guarantees `shops[]` and `activeShop` whatever the API returned
 * (`shop`, `shops`, `activeShop`), keeping the previously selected shop if still valid.
 */
export function normalizeAuthUser(raw: any, previousActiveShopId?: string | null): AuthUser {
  const list: AuthShop[] = [];
  const push = (s: any) => {
    if (s && s.id && !list.some((x) => x.id === s.id)) {
      list.push({
        id: s.id,
        slug: s.slug || s.id,
        name: s.name || 'Boutique',
        craftType: s.craftType || '',
        city: s.city || '',
        country: s.country || '',
        currency: s.currency || 'XOF',
        isVerified: Boolean(s.isVerified),
        kycStatus: (s.kycStatus || 'PENDING') as AuthShop['kycStatus'],
        productsCount: s.productsCount ?? 0,
        ordersCount: s.ordersCount ?? 0,
        role: s.role || 'OWNER',
        bannerUrl: s.bannerUrl ?? null,
      });
    }
  };
  if (Array.isArray(raw?.shops)) raw.shops.forEach(push);
  push(raw?.activeShop);
  push(raw?.shop);

  const active =
    list.find((s) => s.id === previousActiveShopId) ||
    list.find((s) => s.id === raw?.activeShop?.id) ||
    list[0] ||
    null;

  return {
    id: raw?.id,
    email: raw?.email || '',
    phone: raw?.phone ?? null,
    name: raw?.name || '',
    username: raw?.username,
    avatarUrl: raw?.avatarUrl ?? null,
    city: raw?.city,
    role: raw?.role || 'BUYER',
    locale: raw?.locale || 'fr',
    shops: list,
    activeShop: active,
    shop: active,
  };
}

/** True when the user owns or belongs to at least one shop. */
export function hasShop(user?: AuthUser | null): boolean {
  return Boolean(user && (user.activeShop || (user.shops && user.shops.length > 0) || user.shop));
}

/** Current shop of the user (active first, then first membership). */
export function getActiveShop(user?: AuthUser | null): AuthShop | null {
  if (!user) return null;
  return user.activeShop || (user.shops && user.shops[0]) || user.shop || null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterSellerResponse {
  success: boolean;
  shop: {
    id: string;
    slug: string;
    name: string;
    craftType: string;
    city: string;
    country: string;
    isVerified: boolean;
    kycStatus: string;
  };
  message: string;
}

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function getAuthToken(): string | null {
  return _authToken;
}

export async function getValidAuthToken(): Promise<string | null> {
  if (_authToken) return _authToken;
  try {
    const raw = await AsyncStorage.getItem('ojarket.auth.session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        _authToken = parsed.token;
        return _authToken;
      }
    }
  } catch {}
  return null;
}

function authHeaders(): Record<string, string> {
  if (_authToken) {
    return { Authorization: `Bearer ${_authToken}` };
  }
  return {};
}

export const AuthApi = {
  async loginWithEmail(identifier: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    return { token: res.token, user: normalizeAuthUser(res.user) };
  },

  async registerWithEmail(data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { token: res.token, user: normalizeAuthUser(res.user) };
  },

  async loginWithGoogle(data: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { token: res.token, user: normalizeAuthUser(res.user) };
  },

  async updateProfile(data: {
    name?: string;
    username?: string;
    phone?: string;
    email?: string;
  }): Promise<AuthUser> {
    const res = await request<any>('/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeaders(),
    });
    return normalizeAuthUser(res);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
      headers: authHeaders(),
    });
  },

  async getMe(previousActiveShopId?: string | null): Promise<AuthUser> {
    const res = await request<any>('/v1/auth/me', {
      headers: authHeaders(),
    });
    return normalizeAuthUser(res, previousActiveShopId);
  },

  async registerSeller(data: {
    shopName: string;
    craftType: string;
    city?: string;
    description?: string;
    merchantPhone?: string;
  }): Promise<RegisterSellerResponse> {
    return request<RegisterSellerResponse>('/v1/auth/register-seller', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(),
    });
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/v1/auth/delete-account', {
      method: 'POST',
      headers: authHeaders(),
    });
  },
};

// ---------------------------------------------------------
// 7. PRODUITS NUMÉRIQUES & DROITS D'ACCÈS (FR-42 à FR-47)
// ---------------------------------------------------------

export interface DigitalAssetItem {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  version: string;
  isPublicPreview: boolean;
  licenseType: string;
  format: string;
}

export interface DigitalGrantItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  assetTitle: string;
  version: string;
  mimeType: string;
  downloadCount: number;
  maxDownloads: number;
  remainingDownloads: number;
  downloadUrl: string;
  license: string;
  createdAt: string;
}

export const DigitalApi = {
  async getCatalog(): Promise<DigitalAssetItem[]> {
    return request<DigitalAssetItem[]>('/v1/digital/catalog');
  },

  async getEntitlements(): Promise<DigitalGrantItem[]> {
    return request<DigitalGrantItem[]>('/v1/digital/entitlements');
  },

  async download(id: string): Promise<{
    title: string;
    mimeType: string;
    fileUrl: string;
    remainingDownloads: number;
    downloadCount: number;
  }> {
    return request(`/v1/digital/download/${id}`, { method: 'POST' });
  },
};

// ---------------------------------------------------------
// 8. LITIGES & SIGNALEMENT D'INCIDENTS (FR-52 à FR-55)
// ---------------------------------------------------------

export interface IncidentRecord {
  id: string;
  orderId: string;
  orderNumber?: string;
  reporterName: string;
  reporterPhone?: string;
  category: string;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'PROPOSAL_MADE' | 'RESOLVED' | 'CONTESTED' | 'CLOSED' | string;
  resolution?: string;
  proposedOutcome?: string;
  resolvedAt?: string;
  createdAt: string;
}

export const IncidentsApi = {
  async getAll(): Promise<IncidentRecord[]> {
    return request<IncidentRecord[]>('/v1/incidents');
  },

  async getByOrder(orderId: string): Promise<IncidentRecord[]> {
    return request<IncidentRecord[]>(`/v1/incidents/order/${orderId}`);
  },

  async getByShop(shopId: string): Promise<IncidentRecord[]> {
    return request<IncidentRecord[]>(`/v1/incidents/shop/${shopId}`);
  },

  async create(data: {
    orderId: string;
    reporterName: string;
    reporterPhone?: string;
    category?: string;
    title: string;
    description: string;
    evidenceUrls?: string[];
  }): Promise<IncidentRecord> {
    return request<IncidentRecord>('/v1/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addEvidence(id: string, evidenceUrls: string[]): Promise<IncidentRecord> {
    return request<IncidentRecord>(`/v1/incidents/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify({ evidenceUrls }),
    });
  },

  async propose(id: string, proposedOutcome: string): Promise<IncidentRecord> {
    return request<IncidentRecord>(`/v1/incidents/${id}/propose`, {
      method: 'PUT',
      body: JSON.stringify({ proposedOutcome }),
    });
  },

  async resolve(id: string, resolution: string, proposedOutcome?: string): Promise<IncidentRecord> {
    return request<IncidentRecord>(`/v1/incidents/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolution, proposedOutcome }),
    });
  },
};

// ---------------------------------------------------------
// 9. ABONNEMENTS MARCHANDS SAAS (FR-37)
// ---------------------------------------------------------

export interface PlanFeatureDefinition {
  tier: string;
  title: string;
  priceMonthlyMinor: number;
  priceAnnualMinor: number;
  maxProducts: number;
  hasPriorityD02: boolean;
  hasFecExport: boolean;
  hasVipConcierge: boolean;
  featuresList: string[];
}

export interface SubscriptionRecord {
  id: string;
  shopId: string;
  shopName?: string;
  planTier: string;
  status: string;
  billingSource: string;
  billingInterval: string;
  priceMinor: number;
  currency: string;
  maxProducts: number;
  hasPriorityD02: boolean;
  hasFecExport: boolean;
  hasVipConcierge: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  externalPaymentRef?: string;
}

export const SubscriptionsApi = {
  async getPlans(): Promise<PlanFeatureDefinition[]> {
    return request<PlanFeatureDefinition[]>('/v1/subscriptions/plans');
  },

  async getShopSubscription(shopId: string): Promise<SubscriptionRecord> {
    return request<SubscriptionRecord>(`/v1/subscriptions/shop/${shopId}`);
  },

  async upgradePlan(data: {
    shopId: string;
    planTier: string;
    billingInterval?: string;
    billingSource?: string;
    paymentReference?: string;
  }): Promise<SubscriptionRecord> {
    return request<SubscriptionRecord>('/v1/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};


export const CmsApi = {
  async getLandingConfig(): Promise<{ data: any }> {
    return request<{ data: any }>('/v1/cms/landing');
  }
};

export const FavoritesApi = {
  async toggleFavorite(productId: string): Promise<{ isFavorite: boolean; productId: string; totalFavorites: number }> {
    return request(`/v1/favorites/${productId}/toggle`, {
      method: 'POST',
    });
  },

  async getMyIds(): Promise<string[]> {
    try {
      return await request<string[]>('/v1/favorites/my-ids');
    } catch {
      return [];
    }
  },

  async getMyFavorites(): Promise<any[]> {
    return request<any[]>('/v1/favorites');
  },
};

export const ReviewsApi = {
  async getProductReviews(productId: string): Promise<{
    averageRating: number | null;
    reviewsCount: number;
    reviews: any[];
  }> {
    return request(`/v1/reviews/product/${productId}`);
  },

  async getShopReviews(shopId: string): Promise<{
    shopRating: number | null;
    reviewsCount: number;
    reviews: any[];
  }> {
    return request(`/v1/reviews/shop/${shopId}`);
  },

  async canReview(productId: string): Promise<{
    canReview: boolean;
    hasPurchased: boolean;
    existingReview: any | null;
  }> {
    try {
      return await request(`/v1/reviews/can-review/${productId}`);
    } catch {
      return { canReview: false, hasPurchased: false, existingReview: null };
    }
  },

  async createReview(data: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<any> {
    return request('/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const NotificationsApi = {
  async getAll(): Promise<AppNotificationItem[]> {
    try {
      return await request<AppNotificationItem[]>('/v1/notifications', {
        headers: authHeaders(),
      });
    } catch {
      return [];
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await request<{ count: number }>('/v1/notifications/unread-count', {
        headers: authHeaders(),
      });
      return res.count;
    } catch {
      return 0;
    }
  },

  async markAsRead(id: string): Promise<void> {
    await request(`/v1/notifications/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
  },

  async markAllAsRead(): Promise<void> {
    await request('/v1/notifications/mark-all-read', {
      method: 'POST',
      headers: authHeaders(),
    });
  },
};

