import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface RequestOtpDto {
  identifier: string; // phone or email
}

export interface VerifyOtpDto {
  identifier: string;
  code: string;
}

export interface RegisterUserDto {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  password?: string;
}

export interface LoginUserDto {
  identifier: string;
  password?: string;
}

export interface GoogleAuthDto {
  idToken?: string;
  email: string;
  name: string;
  googleId: string;
  avatarUrl?: string;
}

export interface UpdateProfileDto {
  name?: string;
  username?: string;
  phone?: string;
  email?: string;
}

export interface ChangePasswordDto {
  oldPassword?: string;
  newPassword: string;
}

export interface RegisterSellerDto {
  shopName: string;
  craftType: string;
  city?: string;
  description?: string;
  merchantPhone?: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_ojarket_salt_2026').digest('hex');
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async requestOtp(dto: RequestOtpDto) {
    const raw = dto.identifier ? dto.identifier.trim() : '';
    if (!raw) {
      throw new BadRequestException('Numéro de téléphone ou email requis');
    }

    const identifier = raw.startsWith('+') ? raw.replace(/\s+/g, '') : raw.toLowerCase();
    
    // Generate a 6-digit OTP code (predictable 123456 in dev or random)
    const isDev = process.env.NODE_ENV !== 'production';
    const code = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    try {
      await this.prisma.otpToken.updateMany({
        where: { identifier, used: false },
        data: { used: true },
      });

      await this.prisma.otpToken.create({
        data: {
          identifier,
          code,
          expiresAt,
        },
      });
    } catch (dbErr) {
      console.warn('[AUTH] Error storing OTP in DB:', (dbErr as Error).message);
    }

    console.log(`[AUTH SMS GATEWAY] Dispatching OTP code "${code}" to ${identifier}`);

    return {
      success: true,
      identifier,
      message: 'Code de vérification envoyé avec succès.',
      code: isDev ? code : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const raw = dto.identifier ? dto.identifier.trim() : '';
    const code = dto.code ? dto.code.trim() : '';

    if (!raw || !code) {
      throw new BadRequestException('Identifiant et code requis');
    }

    const identifier = raw.startsWith('+') ? raw.replace(/\s+/g, '') : raw.toLowerCase();
    const isDevFallback = code === '123456' && process.env.NODE_ENV !== 'production';

    let valid = isDevFallback;

    try {
      const validToken = await this.prisma.otpToken.findFirst({
        where: {
          identifier,
          code,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (validToken) {
        valid = true;
        await this.prisma.otpToken.update({
          where: { id: validToken.id },
          data: { used: true },
        });
      }
    } catch {
      // ignore
    }

    if (!valid) {
      throw new BadRequestException('Code de vérification invalide ou expiré');
    }

    const isEmail = identifier.includes('@');
    let user = isEmail
      ? await this.prisma.user.findUnique({ where: { email: identifier } })
      : await this.prisma.user.findFirst({ where: { phone: identifier } });

    if (!user) {
      const email = isEmail ? identifier : `${identifier.replace(/[^0-9]/g, '')}@client.ojarket.bj`;
      const phone = isEmail ? null : identifier;
      const defaultName = isEmail 
        ? identifier.split('@')[0] 
        : `Client ${identifier.slice(-4)}`;
      const defaultUsername = `@${defaultName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;

      user = await this.prisma.user.create({
        data: {
          email,
          phone,
          name: defaultName,
          username: defaultUsername,
          role: 'BUYER',
          locale: 'fr',
        },
      });
    }

    const fullProfile = await this.getMe(user.id);
    const sessionToken = `ojk_sess_${user.id}_${Date.now()}`;
    return { token: sessionToken, user: fullProfile };
  }

  async register(dto: RegisterUserDto) {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const name = dto.name ? dto.name.trim() : '';

    if (!email || !name) {
      throw new BadRequestException('Le nom et l\'adresse email sont obligatoires');
    }

    // Process and validate username (no mandatory @, minimum 4 characters)
    const rawUsername = (dto.username || name).trim().replace(/^@+/, '').toLowerCase();
    const cleanUsername = rawUsername.replace(/[^a-z0-9_.-]/g, '_');

    if (cleanUsername.length < 4 || cleanUsername.length > 30) {
      throw new BadRequestException('Le nom d\'utilisateur doit comporter entre 4 et 30 caractères');
    }

    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      throw new BadRequestException('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et points');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new BadRequestException('Un compte existe déjà avec cette adresse email');
    }

    // Check if username already exists (checking both clean and @-prefixed forms)
    const existingUsername = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { username: `@${cleanUsername}` },
        ],
      },
    });
    if (existingUsername) {
      throw new BadRequestException('Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.');
    }

    const passwordHash = dto.password ? hashPassword(dto.password.trim()) : null;

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        username: cleanUsername,
        phone: dto.phone ? dto.phone.trim() : null,
        passwordHash,
        role: 'BUYER',
        locale: 'fr',
      },
    });

    const fullProfile = await this.getMe(user.id);
    const sessionToken = `ojk_sess_${user.id}_${Date.now()}`;
    return { token: sessionToken, user: fullProfile };
  }

  async login(dto: LoginUserDto) {
    const raw = dto.identifier ? dto.identifier.trim() : '';
    if (!raw) {
      throw new BadRequestException('Identifiant (email ou nom d\'utilisateur) requis');
    }

    const cleanRaw = raw.replace(/^@+/, '').toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: raw.toLowerCase() },
          { username: cleanRaw },
          { username: `@${cleanRaw}` },
          { username: raw },
          { phone: raw },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Aucun compte trouvé avec cet identifiant');
    }

    if (dto.password && user.passwordHash) {
      const hashed = hashPassword(dto.password.trim());
      if (hashed !== user.passwordHash) {
        throw new BadRequestException('Mot de passe incorrect');
      }
    }

    const fullProfile = await this.getMe(user.id);
    const sessionToken = `ojk_sess_${user.id}_${Date.now()}`;
    return { token: sessionToken, user: fullProfile };
  }

  async googleAuth(dto: GoogleAuthDto) {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const googleId = dto.googleId ? dto.googleId.trim() : '';
    const name = dto.name ? dto.name.trim() : 'Utilisateur Google';

    if (!email && !googleId) {
      throw new BadRequestException('Email ou identifiant Google requis');
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleId || undefined },
          { email: email || undefined },
        ],
      },
    });

    if (!user) {
      const baseUsername = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          username: uniqueUsername,
          googleId: googleId || null,
          avatarUrl: dto.avatarUrl || null,
          role: 'BUYER',
          locale: 'fr',
          isEmailVerified: true,
        },
      });
    } else {
      if (googleId && !user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: dto.avatarUrl || user.avatarUrl },
        });
      }
    }

    const fullProfile = await this.getMe(user.id);
    const sessionToken = `ojk_sess_${user.id}_${Date.now()}`;
    return { token: sessionToken, user: fullProfile };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const data: any = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.phone) data.phone = dto.phone.trim();
    if (dto.username) {
      const raw = dto.username.trim();
      const clean = raw.startsWith('@') ? raw : `@${raw}`;
      // Check if another user owns this username
      const existing = await this.prisma.user.findUnique({ where: { username: clean } });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Ce nom d utilisateur est déjà utilisé');
      }
      data.username = clean;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.getMe(updated.id);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (dto.oldPassword && user.passwordHash) {
      const hashedOld = hashPassword(dto.oldPassword.trim());
      if (hashedOld !== user.passwordHash) {
        throw new BadRequestException('Ancien mot de passe incorrect');
      }
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException('Le nouveau mot de passe doit comporter au moins 6 caractères');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashPassword(dto.newPassword.trim()),
      },
    });

    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedShops: {
          include: {
            paymentConnections: true,
            _count: { select: { products: true, orders: true } },
          },
        },
        memberships: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const shops = user.ownedShops.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      craftType: s.craftType || 'Artisanat',
      city: s.city,
      country: s.country,
      currency: s.currency,
      isVerified: s.isVerified,
      kycStatus: s.kycStatus,
      productsCount: s._count.products,
      ordersCount: s._count.orders,
      role: 'OWNER',
    }));

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      locale: user.locale,
      shops,
      activeShop: shops.length > 0 ? shops[0] : null,
    };
  }

  async registerSeller(userId: string, dto: RegisterSellerDto) {
    const shopName = dto.shopName ? dto.shopName.trim() : '';
    const craftType = dto.craftType ? dto.craftType.trim() : 'Artisanat';
    if (!shopName) {
      throw new BadRequestException('Le nom de la boutique ou de l atelier est obligatoire');
    }

    const baseSlug = shopName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Session utilisateur introuvable. Veuillez vous reconnecter.');
      }

      const shop = await tx.shop.create({
        data: {
          slug,
          name: shopName,
          craftType,
          city: dto.city || 'Cotonou',
          country: 'Bénin',
          currency: 'XOF',
          description: dto.description || null,
          isVerified: false,
          kycStatus: 'PENDING',
          ownerId: userId,
          memberships: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
          paymentConnections: dto.merchantPhone ? {
            create: [
              { channel: 'MTN_MOMO', merchantPhone: dto.merchantPhone },
              { channel: 'CASH_ON_DELIVERY' }
            ]
          } : {
            create: [
              { channel: 'CASH_ON_DELIVERY' }
            ]
          }
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { role: 'SELLER' },
      });

      return {
        success: true,
        shop: {
          id: shop.id,
          slug: shop.slug,
          name: shop.name,
          craftType: shop.craftType,
          city: shop.city,
          country: shop.country,
          isVerified: shop.isVerified,
          kycStatus: shop.kycStatus,
        },
        message: 'Atelier enregistré avec succès. Votre dossier est en attente d approbation KYC.',
      };
    });
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedShops: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete purchase requests created by the buyer
      const userRequests = await tx.purchaseRequest.findMany({
        where: { buyerId: userId },
        select: { id: true },
      });
      const requestIds = userRequests.map((r) => r.id);
      if (requestIds.length > 0) {
        await tx.sellerProposal.deleteMany({
          where: { requestId: { in: requestIds } },
        });
        await tx.purchaseRequest.deleteMany({
          where: { id: { in: requestIds } },
        });
      }

      // 2. Delete user's memberships
      await tx.shopMembership.deleteMany({
        where: { userId },
      });

      // 3. For any shops owned by this user
      for (const shop of user.ownedShops) {
        const shopOrders = await tx.order.findMany({
          where: { shopId: shop.id },
          select: { id: true },
        });
        const orderIds = shopOrders.map((o) => o.id);
        if (orderIds.length > 0) {
          await tx.reservation.deleteMany({ where: { orderId: { in: orderIds } } });
          await tx.financialEvent.deleteMany({ where: { orderId: { in: orderIds } } });
          await tx.orderIncident.deleteMany({ where: { orderId: { in: orderIds } } });
          await tx.digitalEntitlement.deleteMany({ where: { orderId: { in: orderIds } } });
          await tx.orderLine.deleteMany({ where: { orderId: { in: orderIds } } });
          await tx.order.deleteMany({ where: { id: { in: orderIds } } });
        }
        await tx.subscription.deleteMany({ where: { shopId: shop.id } });
        await tx.shopPaymentConnection.deleteMany({ where: { shopId: shop.id } });
        await tx.dayClosure.deleteMany({ where: { shopId: shop.id } });
        await tx.cashbookEntry.deleteMany({ where: { shopId: shop.id } });
        await tx.product.deleteMany({ where: { shopId: shop.id } });
        await tx.shop.delete({ where: { id: shop.id } });
      }

      // 4. Delete orders placed by this buyer
      const buyerOrders = await tx.order.findMany({
        where: { buyerId: userId },
        select: { id: true },
      });
      const buyerOrderIds = buyerOrders.map((o) => o.id);
      if (buyerOrderIds.length > 0) {
        await tx.reservation.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.financialEvent.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.orderIncident.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.digitalEntitlement.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.orderLine.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.order.deleteMany({ where: { id: { in: buyerOrderIds } } });
      }

      // 5. Delete the user
      await tx.user.delete({
        where: { id: userId },
      });

      return {
        success: true,
        message: 'Votre compte et toutes vos données associées ont été supprimés avec succès.',
      };
    });
  }
}


