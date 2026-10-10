import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';
import { getAdminCorridors } from '@/lib/server/admin';
import { PaymentChannel } from '@prisma/client';

export const dynamic = 'force-dynamic';

export interface CombinedPaymentConnection {
  channel: PaymentChannel;
  name: string;
  category: 'MOBILE_MONEY' | 'CASH' | 'BANK' | 'CARD';
  platformEnabled: boolean;
  shopEnabled: boolean;
  merchantPhone: string;
  merchantNumber: string;
  description: string;
}

const CHANNEL_METADATA: Record<
  PaymentChannel,
  { name: string; category: 'MOBILE_MONEY' | 'CASH' | 'BANK' | 'CARD'; description: string }
> = {
  MTN_MOMO: {
    name: 'MTN Mobile Money Direct',
    category: 'MOBILE_MONEY',
    description: 'Paiement direct par code USSD (*880# / *400#) ou push direct vers le numéro marchand de la boutique.',
  },
  MOOV_MONEY: {
    name: 'Moov Money Direct',
    category: 'MOBILE_MONEY',
    description: 'Paiement direct par push Flooz (*155#) vers le compte marchand Moov de la boutique.',
  },
  CELTIIS_CASH: {
    name: 'Celtiis Cash Direct',
    category: 'MOBILE_MONEY',
    description: 'Règlement instantané via Celtiis Cash Bénin vers votre compte marchand.',
  },
  CASH_ON_DELIVERY: {
    name: 'Paiement à la Livraison (Espèces)',
    category: 'CASH',
    description: 'Le client règle en mains propres lors de la remise en main propre ou de la livraison.',
  },
  DIRECT_TRANSFER: {
    name: 'Virement Bancaire Direct (UEMOA)',
    category: 'BANK',
    description: 'Le client effectue un virement sur votre compte bancaire d\'atelier avec référence de commande.',
  },
  CARD: {
    name: 'Carte Bancaire Vendeur Direct',
    category: 'CARD',
    description: 'Règlement par carte bancaire débit direct sur le terminal / passerelle de votre atelier.',
  },
  PICKUP: {
    name: 'Paiement au Retrait en Boutique',
    category: 'CASH',
    description: 'Règlement physique dans votre atelier ou galerie lors du retrait de la commande.',
  },
};

export async function GET(req: NextRequest) {
  try {
    const context = await requireSellerContext(req);
    const shopId = context.shop.id;

    // 1. Get platform rules (Admin list)
    const corridors = await getAdminCorridors();
    const platformMap = new Map<string, boolean>();
    for (const c of corridors) {
      platformMap.set(c.channel, c.isEnabled);
    }

    // 2. Get shop connections
    const shopConnections = await prisma.shopPaymentConnection.findMany({
      where: { shopId },
    });
    const shopMap = new Map<string, { isActive: boolean; merchantPhone: string | null; merchantNumber: string | null }>();
    for (const sc of shopConnections) {
      shopMap.set(sc.channel, {
        isActive: sc.isActive,
        merchantPhone: sc.merchantPhone,
        merchantNumber: sc.merchantNumber,
      });
    }

    // 3. Merge available channels
    const channels: PaymentChannel[] = [
      'MTN_MOMO',
      'MOOV_MONEY',
      'CELTIIS_CASH',
      'CASH_ON_DELIVERY',
      'DIRECT_TRANSFER',
      'CARD',
    ];

    const result: CombinedPaymentConnection[] = channels.map((ch) => {
      const meta = CHANNEL_METADATA[ch];
      const platformEnabled = platformMap.has(ch) ? (platformMap.get(ch) ?? false) : true;
      const existing = shopMap.get(ch);

      // If never configured, default to platform state for MoMo, false for others
      let shopEnabled = existing ? existing.isActive : ch === 'MTN_MOMO';
      // If platform disabled it, shop cannot have it enabled
      if (!platformEnabled) {
        shopEnabled = false;
      }

      return {
        channel: ch,
        name: meta.name,
        category: meta.category,
        description: meta.description,
        platformEnabled,
        shopEnabled,
        merchantPhone: existing?.merchantPhone || '',
        merchantNumber: existing?.merchantNumber || '',
      };
    });

    return NextResponse.json({
      success: true,
      shopId,
      shopName: context.shop.name,
      connections: result,
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const context = await requireSellerContext(req);
    const shopId = context.shop.id;
    const body = await req.json();

    const updates: Array<{
      channel: PaymentChannel;
      shopEnabled: boolean;
      merchantPhone?: string;
      merchantNumber?: string;
    }> = body.connections || (body.channel ? [body] : []);

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ message: 'Aucune donnée de connexion fournie' }, { status: 400 });
    }

    // 1. Fetch current platform rules to enforce Deny-by-Default A06
    const corridors = await getAdminCorridors();
    const platformMap = new Map<string, boolean>();
    for (const c of corridors) {
      platformMap.set(c.channel, c.isEnabled);
    }

    const savedConnections = [];

    for (const item of updates) {
      const channel = item.channel;
      const platformEnabled = platformMap.has(channel) ? (platformMap.get(channel) ?? false) : true;

      // DENY-BY-DEFAULT A06 ENFORCEMENT:
      // If platform has disabled this channel, seller CANNOT activate it
      if (item.shopEnabled && !platformEnabled) {
        return NextResponse.json(
          {
            message: `Le canal "${channel}" est désactivé au niveau de la plateforme par l'administrateur (Protocole Deny-by-Default A06). Votre boutique ne peut pas l'activer.`,
          },
          { status: 403 }
        );
      }

      const isActive = platformEnabled ? Boolean(item.shopEnabled) : false;
      const merchantPhone = item.merchantPhone?.trim() || null;
      const merchantNumber = item.merchantNumber?.trim() || null;

      const record = await prisma.shopPaymentConnection.upsert({
        where: {
          shopId_channel: {
            shopId,
            channel,
          },
        },
        create: {
          shopId,
          channel,
          isActive,
          merchantPhone,
          merchantNumber,
        },
        update: {
          isActive,
          merchantPhone,
          merchantNumber,
        },
      });

      savedConnections.push(record);
    }

    return NextResponse.json({
      success: true,
      message: 'Moyens de règlement de la boutique enregistrés avec succès.',
      connections: savedConnections,
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message || 'Erreur lors de la mise à jour' }, { status: 400 });
  }
}

export const PUT = PATCH;
