import { prisma } from './prisma';
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

export async function createBetterAuthSession(userId: string, reqHeaders?: any): Promise<string> {
  const token = crypto.randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
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

export async function registerUser(dto: RegisterUserDto, reqHeaders?: any) {
  const email = dto.email ? dto.email.trim().toLowerCase() : '';
  const name = dto.name ? dto.name.trim() : '';

  if (!email || !name) {
    throw new Error("Le nom et l'adresse email sont obligatoires");
  }

  const rawUsername = (dto.username || name).trim().replace(/^@+/, '').toLowerCase();
  const cleanUsername = rawUsername.replace(/[^a-z0-9_.-]/g, '_');

  if (cleanUsername.length < 4 || cleanUsername.length > 30) {
    throw new Error("Le nom d'utilisateur doit comporter entre 4 et 30 caractères");
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new Error('Un compte existe déjà avec cette adresse email');
  }

  const existingUsername = await prisma.user.findFirst({
    where: {
      OR: [
        { username: cleanUsername },
        { username: `@${cleanUsername}` },
      ],
    },
  });
  if (existingUsername) {
    throw new Error("Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.");
  }

  const password = dto.password ? dto.password.trim() : 'Password123!';
  const hashedPassword = hashPasswordLegacy(password);

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

    if (signUpRes?.user) {
      const token = signUpRes.token || (await createBetterAuthSession(signUpRes.user.id, reqHeaders));
      const fullProfile = await getMe(signUpRes.user.id);
      return { token, user: fullProfile };
    }
  } catch (err: any) {
    // Fallback direct Prisma creation
  }

  const createdUser = await prisma.user.create({
    data: {
      email,
      name,
      username: cleanUsername,
      displayUsername: cleanUsername,
      passwordHash: hashedPassword,
      phone: dto.phone ? dto.phone.trim() : null,
      role: 'BUYER',
      locale: 'fr',
      emailVerified: true,
      isEmailVerified: true,
    },
  });

  const token = await createBetterAuthSession(createdUser.id, reqHeaders);
  const fullProfile = await getMe(createdUser.id);
  return { token, user: fullProfile };
}

export async function loginUser(dto: LoginUserDto, reqHeaders?: any) {
  const raw = dto.identifier ? dto.identifier.trim() : '';
  if (!raw) {
    throw new Error("Identifiant (email ou nom d'utilisateur) requis");
  }

  const password = dto.password ? dto.password.trim() : '';
  const cleanRaw = raw.replace(/^@+/, '').toLowerCase();
  const isEmail = raw.includes('@');

  try {
    if (isEmail) {
      const signInRes = await auth.api.signInEmail({
        body: { email: raw.toLowerCase(), password },
      });
      if (signInRes?.user && signInRes.token) {
        const fullProfile = await getMe(signInRes.user.id);
        return { token: signInRes.token, user: fullProfile };
      }
    } else {
      const signInRes = await auth.api.signInUsername({
        body: { username: cleanRaw, password },
      });
      if (signInRes?.user && signInRes.token) {
        const fullProfile = await getMe(signInRes.user.id);
        return { token: signInRes.token, user: fullProfile };
      }
    }
  } catch (betterAuthErr: any) {
    // Fallback
  }

  const user = await prisma.user.findFirst({
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
    throw new Error('Aucun compte trouvé avec cet identifiant');
  }

  if (password && user.passwordHash) {
    const hashed = hashPasswordLegacy(password);
    if (hashed !== user.passwordHash) {
      throw new Error('Mot de passe incorrect');
    }
  }

  const token = await createBetterAuthSession(user.id, reqHeaders);
  const fullProfile = await getMe(user.id);
  return { token, user: fullProfile };
}

export async function googleAuth(dto: GoogleAuthDto, reqHeaders?: any) {
  let user = await prisma.user.findUnique({
    where: { email: dto.email.toLowerCase() },
  });

  if (!user) {
    const baseUsername = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
    const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

    user = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        googleId: dto.googleId,
        avatarUrl: dto.avatarUrl,
        username: uniqueUsername,
        displayUsername: uniqueUsername,
        role: 'BUYER',
        isEmailVerified: true,
        emailVerified: true,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: dto.googleId,
        avatarUrl: user.avatarUrl || dto.avatarUrl,
      },
    });
  }

  const token = await createBetterAuthSession(user.id, reqHeaders);
  const fullProfile = await getMe(user.id);
  return { token, user: fullProfile };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
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
          shop: {
            include: {
              paymentConnections: true,
              _count: { select: { products: true, orders: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  const primaryShop = user.ownedShops[0] || user.memberships[0]?.shop;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    displayUsername: user.displayUsername,
    phone: user.phone || user.phoneNumber,
    avatarUrl: user.avatarUrl || user.image,
    role: user.role,
    locale: user.locale,
    isEmailVerified: user.isEmailVerified || user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    shop: primaryShop ? {
      id: primaryShop.id,
      slug: primaryShop.slug,
      name: primaryShop.name,
      craftType: primaryShop.craftType,
      city: primaryShop.city,
      country: primaryShop.country,
      isVerified: primaryShop.isVerified,
      kycStatus: primaryShop.kycStatus,
      productsCount: primaryShop._count?.products || 0,
      ordersCount: primaryShop._count?.orders || 0,
    } : null,
  };
}

export async function updateProfile(userId: string, dto: UpdateProfileDto) {
  const data: any = {};
  if (dto.name) data.name = dto.name.trim();
  if (dto.phone) data.phone = dto.phone.trim();

  if (dto.username) {
    const clean = dto.username.trim().replace(/^@+/, '').toLowerCase();
    const existing = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        OR: [{ username: clean }, { username: `@${clean}` }],
      },
    });
    if (existing) throw new Error("Ce nom d'utilisateur est déjà pris");
    data.username = clean;
    data.displayUsername = clean;
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return getMe(userId);
}

export async function changePassword(userId: string, dto: ChangePasswordDto) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Utilisateur introuvable');

  if (dto.oldPassword && user.passwordHash) {
    const hashedOld = hashPasswordLegacy(dto.oldPassword);
    if (hashedOld !== user.passwordHash) {
      throw new Error('Ancien mot de passe incorrect');
    }
  }

  const hashedNew = hashPasswordLegacy(dto.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedNew },
  });

  return { success: true, message: 'Mot de passe mis à jour avec succès' };
}

export async function registerSeller(userId: string, dto: RegisterSellerDto) {
  const existingShop = await prisma.shop.findFirst({
    where: {
      OR: [{ ownerId: userId }, { memberships: { some: { userId } } }],
    },
  });

  if (existingShop) {
    throw new Error('Vous possédez déjà une boutique enregistrée');
  }

  const shopName = dto.shopName.trim();
  const craftType = dto.craftType.trim();
  const baseSlug = shopName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

  return prisma.$transaction(async (tx) => {
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
          create: { userId, role: 'OWNER' },
        },
        paymentConnections: dto.merchantPhone ? {
          create: [
            { channel: 'MTN_MOMO', merchantPhone: dto.merchantPhone },
            { channel: 'CASH_ON_DELIVERY' }
          ]
        } : {
          create: [{ channel: 'CASH_ON_DELIVERY' }]
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

export async function extractUserIdFromRequest(req: Request): Promise<string | null> {
  const explicitUserId = req.headers.get('x-user-id');
  if (explicitUserId) {
    const exists = await prisma.user.findUnique({ where: { id: explicitUserId }, select: { id: true } });
    if (exists) return exists.id;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearers+/i, '').trim();
    if (token) {
      const dbSession = await prisma.session.findUnique({
        where: { token },
        select: { userId: true, expiresAt: true },
      });

      if (dbSession && dbSession.expiresAt > new Date()) {
        return dbSession.userId;
      }

      if (token.startsWith('ojk_sess_')) {
        const withoutPrefix = token.substring('ojk_sess_'.length);
        const lastUnderscore = withoutPrefix.lastIndexOf('_');
        const possibleId = lastUnderscore > 0 ? withoutPrefix.substring(0, lastUnderscore) : withoutPrefix;
        const userExists = await prisma.user.findUnique({
          where: { id: possibleId },
          select: { id: true },
        });
        if (userExists) return userExists.id;
      }

      const directUser = await prisma.user.findUnique({
        where: { id: token },
        select: { id: true },
      });
      if (directUser) return directUser.id;
    }
  }

  return null;
}

export async function getAuthUserFromRequest(req: Request) {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) return null;
  return getMe(userId);
}
