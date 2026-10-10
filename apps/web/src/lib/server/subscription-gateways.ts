import { prisma } from './prisma';

export interface SubscriptionGatewayConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconType: 'mobile' | 'card';
  isEnabled: boolean;
  supportedCurrencies: string[];
  supportedMethods: string[];
}

export const DEFAULT_SUBSCRIPTION_GATEWAYS: Record<string, SubscriptionGatewayConfig> = {
  moneroo: {
    id: 'moneroo',
    name: 'Moneroo',
    subtitle: 'Mobile Money UEMOA (Wave, MTN, Moov, Orange)',
    description: 'Agrégateur certifié pour les règlements Mobile Money au Bénin, Côte d\'Ivoire, Sénégal et Togo.',
    iconType: 'mobile',
    isEnabled: true,
    supportedCurrencies: ['XOF'],
    supportedMethods: ['Wave', 'MTN Mobile Money', 'Moov Money', 'Orange Money'],
  },
  dodopayments: {
    id: 'dodopayments',
    name: 'Dodo Payments / Cartes',
    subtitle: 'Cartes CB, Visa, Mastercard, Apple Pay',
    description: 'Passerelle internationale de haute sécurité pour les souscriptions par carte bancaire.',
    iconType: 'card',
    isEnabled: true,
    supportedCurrencies: ['XOF', 'EUR', 'USD'],
    supportedMethods: ['Visa', 'Mastercard', 'Carte Bancaire', 'Apple Pay'],
  },
};

export async function getSubscriptionGateways(): Promise<Record<string, SubscriptionGatewayConfig>> {
  try {
    const config = await prisma.platformConfig.findUnique({
      where: { id: 'subscription_gateways' },
    });

    if (!config || !config.data || typeof config.data !== 'object') {
      return DEFAULT_SUBSCRIPTION_GATEWAYS;
    }

    const data = config.data as Record<string, any>;
    const merged: Record<string, SubscriptionGatewayConfig> = { ...DEFAULT_SUBSCRIPTION_GATEWAYS };

    for (const [key, defaultVal] of Object.entries(DEFAULT_SUBSCRIPTION_GATEWAYS)) {
      if (data[key]) {
        merged[key] = {
          ...defaultVal,
          isEnabled: typeof data[key].isEnabled === 'boolean' ? data[key].isEnabled : defaultVal.isEnabled,
        };
      }
    }

    return merged;
  } catch (err) {
    console.error('Erreur getSubscriptionGateways:', err);
    return DEFAULT_SUBSCRIPTION_GATEWAYS;
  }
}

export async function updateSubscriptionGateways(
  updates: Record<string, boolean>
): Promise<Record<string, SubscriptionGatewayConfig>> {
  const current = await getSubscriptionGateways();

  for (const [key, isEnabled] of Object.entries(updates)) {
    if (current[key]) {
      current[key] = {
        ...current[key],
        isEnabled,
      };
    }
  }

  await prisma.platformConfig.upsert({
    where: { id: 'subscription_gateways' },
    create: {
      id: 'subscription_gateways',
      data: current as any,
    },
    update: {
      data: current as any,
    },
  });

  return current;
}
