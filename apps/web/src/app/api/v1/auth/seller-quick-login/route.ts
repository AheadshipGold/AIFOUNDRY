import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getMe } from '@/lib/server/auth';
import crypto from 'crypto';

export async function POST() {
  try {
    // 1. Rechercher en priorité la boutique officielle Kingston Bio ou la première boutique vérifiée
    const shop = await prisma.shop.findFirst({
      where: {
        OR: [{ slug: 'kingston-bio' }, { isVerified: true }],
      },
      include: { owner: true },
    });

    if (!shop || !shop.owner) {
      return NextResponse.json({ message: 'Aucune boutique marchande trouvée.' }, { status: 404 });
    }

    // 2. Générer une session valide et persistante
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    await prisma.session.create({
      data: {
        userId: shop.owner.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        ipAddress: '127.0.0.1',
        userAgent: 'Merchant OS Web (Quick Access)',
      },
    });

    // 3. Récupérer le profil complet de l'artisan
    const fullProfile = await getMe(shop.owner.id);

    return NextResponse.json({
      success: true,
      token,
      user: fullProfile,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
      },
    });
  } catch (err: any) {
    console.error('Quick seller login error:', err);
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la connexion rapide marchand' },
      { status: 500 }
    );
  }
}
