export interface UserDto {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopDto {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  marketId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ShopMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface ShopMemberDto {
  id: string;
  shopId: string;
  userId: string;
  role: ShopMemberRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketDto {
  id: string;
  code: string; // e.g., 'BJ', 'CI'
  name: string;
  currency: string; // e.g., 'XOF'
  isActive: boolean;
}

export interface ProductDto {
  id: string;
  shopId: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantDto {
  id: string;
  productId: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  status: 'ACTIVE' | 'ARCHIVED';
}
