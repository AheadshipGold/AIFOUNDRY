import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

export interface PublicPaymentCorridor {
  id: string;
  code: string;
  title: string;
  category: 'MOBILE_MONEY' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';
  operator: string;
  currency: string;
  isEnabled: boolean;
  minAmountMinor: number;
  maxAmountMinor: number;
}

const CHANNEL_METADATA: Record<string, { title: string; category: PublicPaymentCorridor['category']; operator: string }> = {
  MTN_MOMO: {
    title: 'MTN Mobile Money',
    category: 'MOBILE_MONEY',
    operator: 'MTN MoMo Bénin & UEMOA',
  },
  MOOV_MONEY: {
    title: 'Moov Money Flooz',
    category: 'MOBILE_MONEY',
    operator: 'Moov Africa',
  },
  CELTIIS_CASH: {
    title: 'Celtiis Cash',
    category: 'MOBILE_MONEY',
    operator: 'SBIN / Celtiis',
  },
  CARD: {
    title: 'Carte Bancaire (Visa & Mastercard)',
    category: 'CARD',
    operator: 'Paiement Sécurisé CB / Visa / Mastercard',
  },
  DIRECT_TRANSFER: {
    title: 'Virement Bancaire Certifié',
    category: 'BANK_TRANSFER',
    operator: 'Banque Partenaire UEMOA / Swift',
  },
  CASH_ON_DELIVERY: {
    title: 'Paiement à la Livraison',
    category: 'OTHER',
    operator: 'Règlement en Main Propre Sécurisé',
  },
};

export async function GET() {
  try {
    let corridorRules = await prisma.paymentCorridorRule.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (corridorRules.length === 0) {
      await prisma.paymentCorridorRule.createMany({
        data: [
          { countryCode: 'BJ', currency: 'XOF', channel: 'MTN_MOMO', isEnabled: true, denyByDefault: true, requiredKycLevel: 'STANDARD', minAmountMinor: 10000, maxAmountMinor: 500000000 },
          { countryCode: 'BJ', currency: 'XOF', channel: 'MOOV_MONEY', isEnabled: true, denyByDefault: true, requiredKycLevel: 'STANDARD', minAmountMinor: 10000, maxAmountMinor: 500000000 },
          { countryCode: 'BJ', currency: 'XOF', channel: 'CELTIIS_CASH', isEnabled: true, denyByDefault: true, requiredKycLevel: 'STANDARD', minAmountMinor: 10000, maxAmountMinor: 200000000 },
          { countryCode: 'BJ', currency: 'XOF', channel: 'CARD', isEnabled: true, denyByDefault: true, requiredKycLevel: 'STANDARD', minAmountMinor: 10000, maxAmountMinor: 500000000 },
          { countryCode: 'BJ', currency: 'XOF', channel: 'DIRECT_TRANSFER', isEnabled: false, denyByDefault: true, requiredKycLevel: 'ENHANCED', minAmountMinor: 5000000, maxAmountMinor: 1000000000 },
        ],
      });

      corridorRules = await prisma.paymentCorridorRule.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    const activeCorridors: PublicPaymentCorridor[] = corridorRules
      .filter((r) => r.isEnabled)
      .map((r) => {
        const meta = CHANNEL_METADATA[r.channel] || {
          title: r.channel.replace(/_/g, ' '),
          category: 'OTHER',
          operator: 'Passerelle Agréée',
        };

        return {
          id: r.id,
          code: r.channel,
          title: meta.title,
          category: meta.category,
          operator: meta.operator,
          currency: r.currency,
          isEnabled: r.isEnabled,
          minAmountMinor: r.minAmountMinor,
          maxAmountMinor: r.maxAmountMinor,
        };
      });

    return NextResponse.json({
      success: true,
      corridors: activeCorridors,
      policy: 'DENY_BY_DEFAULT_ACTIVE',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, corridors: [] }, { status: 500 });
  }
}
