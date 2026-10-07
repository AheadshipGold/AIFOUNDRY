import { prisma } from './prisma';
import { auth } from './better-auth';
import { fromNodeHeaders } from 'better-auth/node';

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

function createRequestHeaders(reqHeaders?: any): Headers {
  const headers = new Headers();
  headers.set('host', 'localhost:3000');
  headers.set('origin', 'http://localhost:3000');
  if (reqHeaders) {
    if (typeof reqHeaders.get === 'function') {
      reqHeaders.forEach((val: string, key: string) => headers.set(key, val));
    } else {
      for (const [k, v] of Object.entries(reqHeaders)) {
        if (typeof v === 'string') headers.set(k, v);
      }
    }
  }
  return headers;
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
  const headers = createRequestHeaders(reqHeaders);

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
    headers,
  });

  if (!signUpRes?.user) {
    throw new Error("Échec de la création du compte par Better Auth");
  }

  let token = signUpRes.token;
  if (!token) {
    const session = await prisma.session.findFirst({
      where: { userId: signUpRes.user.id },
      orderBy: { createdAt: 'desc' },
    });
    token = session?.token || '';
  }

  const fullProfile = await getMe(signUpRes.user.id);
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
  const headers = createRequestHeaders(reqHeaders);

  let signInRes: any;
  if (isEmail) {
    signInRes = await auth.api.signInEmail({
      body: { email: raw.toLowerCase(), password },
      headers,
    });
  } else {
    signInRes = await auth.api.signInUsername({
      body: { username: cleanRaw, password },
      headers,
    });
  }

  if (!signInRes?.user) {
    throw new Error('Identifiant ou mot de passe incorrect');
  }

  let token = signInRes.token;
  if (!token) {
    const session = await prisma.session.findFirst({
      where: { userId: signInRes.user.id },
      orderBy: { createdAt: 'desc' },
    });
    token = session?.token || '';
  }

  const fullProfile = await getMe(signInRes.user.id);
  return { token, user: fullProfile };
}

export async function googleAuth(dto: GoogleAuthDto, reqHeaders?: any) {
  const email = dto.email.toLowerCase();
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const baseUsername = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
    const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

    user = await prisma.user.create({
      data: {
        email,
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

    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: dto.googleId,
        providerId: 'google',
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

    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: 'google' },
    });
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: dto.googleId,
          providerId: 'google',
        },
      });
    }
  }

  // Create an authentic session via Better Auth adapter table
  const token = require('crypto').randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

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

export async function changePassword(userId: string, dto: ChangePasswordDto, reqHeaders?: any) {
  const headers = createRequestHeaders(reqHeaders);
  const result = await auth.api.changePassword({
    body: {
      currentPassword: dto.oldPassword || '',
      newPassword: dto.newPassword,
      revokeOtherSessions: true,
    },
    headers,
  });

  return { success: true, message: 'Mot de passe mis à jour avec succès via Better Auth' };
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
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      const dbSession = await prisma.session.findUnique({
        where: { token },
        select: { userId: true, expiresAt: true },
      });

      if (dbSession && dbSession.expiresAt > new Date()) {
        return dbSession.userId;
      }
    }
  }

  // Check session cookie via Better Auth getSession
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {}

  return null;
}

export async function getAuthUserFromRequest(req: Request) {
  const userId = await extractUserIdFromRequest(req);
  if (!userId) return null;
  return getMe(userId);
}
