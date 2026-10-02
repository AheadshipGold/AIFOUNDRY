// Ojarket Mobile API Client
// Connects to local NestJS backend with intelligent offline fallback

import { Platform } from 'react-native';

// On Android Emulator: use 10.0.2.2. On physical device: machine LAN IP. On web: localhost.
const DEFAULT_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  default: 'http://localhost:3001',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
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
  async getProducts(query?: string, category?: string): Promise<ProductItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<ProductItem[]>(`/v1/products${queryString}`);
  },

  async getProduct(id: string): Promise<ProductItem> {
    return request<ProductItem>(`/v1/products/${id}`);
  },
};

// ---------------------------------------------------------
// 2. DEMANDES SUR-MESURE & DEVIS (D02)
// ---------------------------------------------------------

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

  async create(data: {
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
};

// ---------------------------------------------------------
// 3. COMMANDES (ACHATS & VENDEUR)
// ---------------------------------------------------------

export interface OrderItemLine {
  variantId: string;
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
  async getAll(): Promise<OrderRecord[]> {
    return request<OrderRecord[]>('/v1/orders');
  },

  async getOne(id: string): Promise<OrderRecord> {
    return request<OrderRecord>(`/v1/orders/${id}`);
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
    });
  },

  async updateStatus(
    id: string,
    updates: { paymentStatus?: string; fulfillmentStatus?: string }
  ): Promise<OrderRecord> {
    return request<OrderRecord>(`/v1/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
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
};

// ---------------------------------------------------------
// 5. AUTHENTIFICATION & SESSION
// ---------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  name: string;
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

export interface OtpResponse {
  success: boolean;
  identifier: string;
  message: string;
  code?: string; // only in dev
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

function authHeaders(): Record<string, string> {
  if (_authToken) {
    return { Authorization: `Bearer ${_authToken}` };
  }
  return {};
}

export const AuthApi = {
  async requestOtp(identifier: string): Promise<OtpResponse> {
    return request<OtpResponse>('/v1/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  async verifyOtp(identifier: string, code: string): Promise<AuthResponse> {
    return request<AuthResponse>('/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, code }),
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
};
