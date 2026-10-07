// Ojarket Web API Client
// Unified client connecting Next.js to NestJS & Better Auth backend

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  image?: string;
  avatarUrl?: string;
  shopName?: string;
  shopInitials?: string;
  activeShop?: {
    id: string;
    slug: string;
    name: string;
    craftType?: string;
    city?: string;
    isVerified?: boolean;
    kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  };
  shops?: Array<{
    id: string;
    slug: string;
    name: string;
    craftType?: string;
    city?: string;
    isVerified?: boolean;
    kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
    role: string;
  }>;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message?: string;
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

const API_BASE_URL = '/api';
const TOKEN_KEY = 'ojarket_token';
const USER_KEY = 'ojarket_web_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {}
}

export function clearSession() {
  setStoredToken(null);
  setStoredUser(null);
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();
  const user = getStoredUser();

  const customHeaders = (options?.headers as Record<string, string>) || {};
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
    ...(token && !customHeaders['Authorization'] ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id && !customHeaders['x-user-id'] ? { 'x-user-id': user.id } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers: finalHeaders,
  });

  if (!res.ok) {
    let errDetail = res.statusText;
    try {
      const errorJson = await res.json();
      if (errorJson && errorJson.message) {
        errDetail = Array.isArray(errorJson.message) ? errorJson.message.join(', ') : errorJson.message;
      }
    } catch {
      // fallback
    }
    throw new Error(errDetail || `Erreur HTTP ${res.status}`);
  }

  return await res.json();
}

export const AuthApi = {
  async loginWithEmail(identifier: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.token) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
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
    if (res.token) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
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
    if (res.token) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async getMe(): Promise<AuthUser> {
    const user = await request<AuthUser>('/v1/auth/me');
    setStoredUser(user);
    return user;
  },

  async updateProfile(data: {
    name?: string;
    username?: string;
    phone?: string;
    email?: string;
  }): Promise<AuthUser> {
    const user = await request<AuthUser>('/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setStoredUser(user);
    return user;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  async registerSeller(data: {
    shopName: string;
    craftType: string;
    city?: string;
    description?: string;
    merchantPhone?: string;
  }): Promise<RegisterSellerResponse> {
    const res = await request<RegisterSellerResponse>('/v1/auth/register-seller', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // refresh profile
    try {
      await AuthApi.getMe();
    } catch {}
    return res;
  },

  logout(): void {
    clearSession();
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const res = await request<{ success: boolean; message: string }>('/v1/auth/delete-account', {
      method: 'POST',
    });
    clearSession();
    return res;
  },
};

export interface OrderRecord {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone?: string;
  deliveryAddress?: string;
  totalAmountMinor: number;
  currency: string;
  paymentChannel?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
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
  proposals?: any[];
  createdAt: string;
}

export interface FinOpsEntry {
  id: string;
  type: 'ENCAISSEMENT' | 'DECAISSEMENT' | 'VENTE_A_CREDIT';
  label: string;
  channel: string;
  amountMinor: number;
  currency?: string;
  reference: string;
  time: string;
  source?: string;
  status?: string;
}

export interface CashbookData {
  summary: {
    totalVenduMinor: number;
    totalEncaisseMinor: number;
    totalRestantMinor: number;
  };
  recentEntries: FinOpsEntry[];
}

export interface SellerDashboardData {
  kpis: Array<{ label: string; value: string; trend?: string; positive?: boolean }>;
  priorities?: Array<{ label: string; count: string; action: string }>;
}

export const SellerApi = {
  async getDashboard(shopId?: string): Promise<SellerDashboardData> {
    const q = shopId ? `?shopId=${encodeURIComponent(shopId)}` : '';
    return request<SellerDashboardData>(`/v1/seller/dashboard${q}`);
  },

  async getCashbook(shopId?: string): Promise<CashbookData> {
    const q = shopId ? `?shopId=${encodeURIComponent(shopId)}` : '';
    return request<CashbookData>(`/v1/seller/cashbook${q}`);
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
    notes?: string;
  }): Promise<any> {
    return request('/v1/seller/cashbook/close', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const OrdersApi = {
  async getAll(shopId?: string): Promise<OrderRecord[]> {
    const q = shopId ? `?shopId=${encodeURIComponent(shopId)}` : '';
    return request<OrderRecord[]>(`/v1/orders${q}`);
  },
  async create(data: {
    buyerId?: string;
    buyerName: string;
    buyerPhone: string;
    deliveryAddress: string;
    paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY';
    items: Array<{ variantId: string; quantity: number }>;
  }): Promise<OrderRecord> {
    return request<OrderRecord>('/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

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
  rating: number | null;
  reviewsCount: number;
}

export const CatalogApi = {
  async getProducts(query?: string, category?: string, shopId?: string): Promise<ProductItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'all') params.append('category', category);
    if (shopId) params.append('shopId', shopId);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<ProductItem[]>(`/v1/products${q}`);
  },

  async getProduct(id: string): Promise<ProductItem> {
    return request<ProductItem>(`/v1/products/${id}`);
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
    });
  },
};

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

export const RequestsApi = {
  async getAll(buyerId?: string): Promise<PurchaseRequestItem[]> {
    const q = buyerId ? `?buyerId=${encodeURIComponent(buyerId)}` : '';
    return request<PurchaseRequestItem[]>(`/v1/requests${q}`);
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
  ): Promise<any> {
    return request(`/v1/requests/${requestId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};


export const CmsApi = {
  async getLandingConfig(): Promise<{ data: any }> {
    return request<{ data: any }>('/v1/cms/landing');
  },
  async updateLandingConfig(data: any): Promise<{ data: any }> {
    return request<{ data: any }>('/v1/cms/landing', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

