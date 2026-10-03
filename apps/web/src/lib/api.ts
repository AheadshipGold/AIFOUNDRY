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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
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

  const customHeaders = (options?.headers as Record<string, string>) || {};
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
    ...(token && !customHeaders['Authorization'] ? { Authorization: `Bearer ${token}` } : {}),
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
