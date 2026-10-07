// Ojarket Mobile API Client
// Connects to local NestJS backend with intelligent offline fallback

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamic API resolution: on physical device via Expo Dev Client, Metro's hostUri provides the machine LAN IP.
// Default to the computer's LAN IP 10.33.188.162 for physical devices on same Wi-Fi.
const debuggerHost = Constants.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost || (Constants as any)?.manifest?.debuggerHost;
const host = debuggerHost ? debuggerHost.split(':')[0] : '10.33.188.162';

export const API_BASE_URL = debuggerHost ? `http://${host}:3000/api` : (process.env.EXPO_PUBLIC_API_URL || 'http://10.33.188.162:3000/api');

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const customHeaders = (options?.headers as Record<string, string>) || {};
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
      } catch {
        // use default statusText
      }
      throw new Error(errDetail || `Erreur API ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[API] Failed to fetch ${url}:`, (err as Error).message);
    throw err;
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
    items: Array<{ variantId: string; quantity: number }>;
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
};

// ---------------------------------------------------------
// 4. ESPACE VENDEUR & CAISSE FINOPS
// ---------------------------------------------------------

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

export interface DayClosureRecord {
  id: string;
  date: string;
  totalVenduMinor: number;
  totalEncaisseMinor: number;
  totalRestantMinor: number;
  varianceMinor: number;
  status: 'EQUILIBRE' | 'ECART_SIGNALE' | 'BALANCED';
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

export const SellerApi = {
  async getDashboard(): Promise<SellerDashboardData> {
    return request<SellerDashboardData>('/v1/seller/dashboard');
  },

  async getCashbook(): Promise<CashbookData> {
    return request<CashbookData>('/v1/seller/cashbook');
  },

  async recordCollection(data: {
    label: string;
    amountMinor: number;
    channel: string;
    reference?: string;
    notes?: string;
  }): Promise<any> {
    return request('/v1/seller/cashbook/collect', {
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

  async exportFec(): Promise<{ filename: string; content: string; mimeType: string }> {
    return request<{ filename: string; content: string; mimeType: string }>('/v1/seller/cashbook/export-fec', {
      headers: authHeaders(),
    });
  },

  async exportCsv(): Promise<{ filename: string; content: string; mimeType: string }> {
    return request<{ filename: string; content: string; mimeType: string }>('/v1/seller/cashbook/export-csv', {
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
  city?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | 'OPERATOR';
  locale: string;
  shops: AuthShop[];
  activeShop: AuthShop | null;
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
    return request<AuthResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  async registerWithEmail(data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async loginWithGoogle(data: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>('/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProfile(data: {
    name?: string;
    username?: string;
    phone?: string;
    email?: string;
  }): Promise<AuthUser> {
    return request<AuthUser>('/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeaders(),
    });
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
      headers: authHeaders(),
    });
  },

  async getMe(): Promise<AuthUser> {
    return request<AuthUser>('/v1/auth/me', {
      headers: authHeaders(),
    });
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

