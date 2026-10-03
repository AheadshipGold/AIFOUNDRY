import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { auth } from './better-auth';
import * as crypto from 'crypto';

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

function hashPasswordLegacy(password: string): string {
  return crypto.createHash('sha256').update(password + '_ojarket_salt_2026').digest('hex');
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: creates a Better Auth session in the database and returns token
   */
  private async createBetterAuthSession(userId: string, reqHeaders?: any): Promise<string> {
    const token = crypto.randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
        ipAddress: reqHeaders?.['x-forwarded-for'] || reqHeaders?.ip || null,
        userAgent: reqHeaders?.['user-agent'] || null,
      },
    });

    return token;
  }

  /**
   * Register a new user using Better Auth
   */
  async register(dto: RegisterUserDto, reqHeaders?: any) {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const name = dto.name ? dto.name.trim() : '';

    if (!email || !name) {
      throw new BadRequestException("Le nom et l'adresse email sont obligatoires");
    }

    // Process and validate username (no mandatory @, minimum 4 characters)
    const rawUsername = (dto.username || name).trim().replace(/^@+/, '').toLowerCase();
    const cleanUsername = rawUsername.replace(/[^a-z0-9_.-]/g, '_');

    if (cleanUsername.length < 4 || cleanUsername.length > 30) {
      throw new BadRequestException("Le nom d'utilisateur doit comporter entre 4 et 30 caractères");
    }

    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      throw new BadRequestException("Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et points");
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new BadRequestException('Un compte existe déjà avec cette adresse email');
    }

    // Check if username already exists
    const existingUsername = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { username: `@${cleanUsername}` },
        ],
      },
    });
    if (existingUsername) {
      throw new BadRequestException("Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.");
    }

    const password = dto.password ? dto.password.trim() : 'Password123!';

    try {
      const signUpRes = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          username: cleanUsername,
          displayUsername: cleanUsername,
          phone: dto.phone ? dto.phone.trim() : undefined,
          role: 'BUYER',
          locale: 'fr',
        },
      });

      if (!signUpRes?.user) {
        throw new Error("Échec de la création de l'utilisateur par Better Auth");
      }

      const token = signUpRes.token || (await this.createBetterAuthSession(signUpRes.user.id, reqHeaders));
      const fullProfile = await this.getMe(signUpRes.user.id);
      return { token, user: fullProfile };
    } catch (err: any) {
      // If Better Auth throws, rewrap gracefully
      const msg = err?.message || 'Erreur lors de la création du compte';
      throw new BadRequestException(msg);
    }
  }

  /**
   * Login user via Better Auth (supports email or username)
   */
  async login(dto: LoginUserDto, reqHeaders?: any) {
    const raw = dto.identifier ? dto.identifier.trim() : '';
    if (!raw) {
      throw new BadRequestException("Identifiant (email ou nom d'utilisateur) requis");
    }

    const password = dto.password ? dto.password.trim() : '';
    const cleanRaw = raw.replace(/^@+/, '').toLowerCase();
    const isEmail = raw.includes('@');

    try {
      if (isEmail) {
        // Attempt sign-in with Better Auth email provider
        const signInRes = await auth.api.signInEmail({
          body: {
            email: raw.toLowerCase(),
            password,
          },
        });

        if (signInRes?.user && signInRes.token) {
          const fullProfile = await this.getMe(signInRes.user.id);
          return { token: signInRes.token, user: fullProfile };
        }
      } else {
        // Attempt sign-in with Better Auth username plugin
        const signInRes = await auth.api.signInUsername({
          body: {
            username: cleanRaw,
            password,
          },
        });

        if (signInRes?.user && signInRes.token) {
          const fullProfile = await this.getMe(signInRes.user.id);
          return { token: signInRes.token, user: fullProfile };
        }
      }
    } catch (betterAuthErr: any) {
      // If Better Auth rejected because of legacy password hashing on pre-existing users, check legacy hash
    }

    // Fallback verification for pre-existing database accounts
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

    if (password && user.passwordHash) {
      const hashed = hashPasswordLegacy(password);
      if (hashed !== user.passwordHash) {
        throw new BadRequestException('Mot de passe incorrect');
      }
    }

    // Create a recognized Better Auth session
    const token = await this.createBetterAuthSession(user.id, reqHeaders);
    const fullProfile = await this.getMe(user.id);
    return { token, user: fullProfile };
  }

  /**
   * Google OAuth 2.0 Native Sign-In / Sign-Up
   */
  async googleAuth(dto: GoogleAuthDto, reqHeaders?: any) {
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
      include: {
        accounts: true,
      },
    });

    if (!user) {
      const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          username: uniqueUsername,
          displayUsername: uniqueUsername,
          googleId: googleId || null,
          avatarUrl: dto.avatarUrl || null,
          role: 'BUYER',
          locale: 'fr',
          emailVerified: true,
          isEmailVerified: true,
          accounts: googleId ? {
            create: {
              accountId: googleId,
              providerId: 'google',
            },
          } : undefined,
        },
        include: {
          accounts: true,
        },
      });
    } else {
      // Link Google Account if not yet linked
      const hasGoogleAccount = user.accounts.some((a) => a.providerId === 'google');
      if (googleId && !hasGoogleAccount) {
        await this.prisma.account.create({
          data: {
            userId: user.id,
            accountId: googleId,
            providerId: 'google',
          },
        });
      }

      if (googleId && !user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: dto.avatarUrl || user.avatarUrl,
            emailVerified: true,
          },
          include: { accounts: true },
        });
      }
    }

    // Create Better Auth session in database
    const token = await this.createBetterAuthSession(user.id, reqHeaders);
    const fullProfile = await this.getMe(user.id);
    return { token, user: fullProfile };
  }

  /**
   * Update User Profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const data: any = {};
    if (dto.name) data.name = dto.name.trim();
    if (dto.phone) data.phone = dto.phone.trim();
    if (dto.username) {
      const raw = dto.username.trim().replace(/^@+/, '');
      if (raw.length < 4 || raw.length > 30) {
        throw new BadRequestException("Le nom d'utilisateur doit comporter entre 4 et 30 caractères");
      }
      // Check if another user owns this username
      const existing = await this.prisma.user.findFirst({
        where: {
          OR: [{ username: raw }, { username: `@${raw}` }],
        },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException("Ce nom d'utilisateur est déjà utilisé");
      }
      data.username = raw;
      data.displayUsername = raw;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.getMe(updated.id);
  }

  /**
   * Change Password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException('Le nouveau mot de passe doit comporter au moins 6 caractères');
    }

    // Check legacy password hash if applicable
    if (dto.oldPassword && user.passwordHash) {
      const hashedOld = hashPasswordLegacy(dto.oldPassword.trim());
      if (hashedOld !== user.passwordHash) {
        throw new BadRequestException('Ancien mot de passe incorrect');
      }
    }

    const newHash = hashPasswordLegacy(dto.newPassword.trim());

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
      },
    });

    // Also update or create credential account record
    const credAccount = user.accounts.find((a) => a.providerId === 'credential');
    if (credAccount) {
      await this.prisma.account.update({
        where: { id: credAccount.id },
        data: { password: newHash },
      });
    } else {
      await this.prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: newHash,
        },
      });
    }

    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    };
  }

  /**
   * Get User Profile with owned shops and membership details
   */
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
      displayUsername: user.displayUsername || user.username,
      phone: user.phone || user.phoneNumber,
      name: user.name,
      avatarUrl: user.avatarUrl || user.image,
      role: user.role,
      locale: user.locale,
      shops,
      activeShop: shops.length > 0 ? shops[0] : null,
    };
  }

  /**
   * Register a seller boutique/shop
   */
  async registerSeller(userId: string, dto: RegisterSellerDto) {
    const shopName = dto.shopName ? dto.shopName.trim() : '';
    const craftType = dto.craftType ? dto.craftType.trim() : 'Commerce Général';
    if (!shopName) {
      throw new BadRequestException("Le nom de la boutique est obligatoire");
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
        message: "Boutique enregistrée avec succès. Votre dossier est en attente d'approbation KYC.",
      };
    });
  }

  /**
   * Delete user account and cascade clean all related resources
   */
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

      // 5. Delete sessions & accounts
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });

      // 6. Delete the user
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
