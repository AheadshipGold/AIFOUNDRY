import * as crypto from 'crypto';
import { prisma } from './prisma';

export interface CreatePaymentSessionParams {
  shopId: string;
  planTier: string;
  amountMinor: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  returnUrl?: string;
  referenceId: string;
  billingInterval?: string;
}

export class MonerooAdapter {
  private readonly apiKey?: string;
  private readonly webhookSecret?: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.MONEROO_SECRET_KEY || process.env.MONEROO_API_KEY;
    this.webhookSecret = process.env.MONEROO_WEBHOOK_SECRET;
    this.baseUrl = process.env.MONEROO_API_BASE_URL || 'https://api.moneroo.io';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async createSession(params: CreatePaymentSessionParams) {
    const { shopId, planTier, amountMinor, currency, description, customerEmail, customerName, customerPhone, returnUrl, referenceId, billingInterval } = params;
    const amountMajor = Math.round(amountMinor / 100);

    if (!this.isConfigured()) {
      return {
        referenceId,
        checkoutUrl: `/seller/subscription?status=simulated&plan=${planTier}&ref=${referenceId}`,
        redirectRequired: true,
        status: 'SIMULATED',
        instructions: 'Environnement de démonstration : simulation du paiement Mobile Money acceptée.',
        isSandbox: true,
      };
    }

    const payload: Record<string, unknown> = {
      amount: amountMajor,
      currency: currency || 'XOF',
      description: description || `Ojarket - Abonnement Marchand ${planTier}`,
      customer: {
        email: customerEmail,
        first_name: customerName || 'Vendeur',
        last_name: 'Ojarket',
        phone: customerPhone || undefined,
      },
      return_url: returnUrl || 'https://www.ojarket.com/seller/subscription?status=success',
      metadata: { shopId, planTier, billingInterval: billingInterval || 'MONTHLY', referenceId },
    };

    const response = await fetch(`${this.baseUrl}/v1/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Échec Moneroo API (${response.status})`);
    }

    const data = await response.json();
    return {
      referenceId,
      checkoutUrl: data?.data?.checkout_url || data?.checkout_url,
      redirectRequired: true,
      status: 'PENDING',
      providerRawResponse: data,
      instructions: 'Veuillez finaliser le paiement sur votre mobile.',
      isSandbox: false,
    };
  }

  verifyWebhookSignature(rawBody: string, signatureHeader?: string): boolean {
    if (!this.webhookSecret) {
      // In production, missing webhook secret must deny
      if (process.env.NODE_ENV === 'production') return false;
      return true;
    }
    if (!signatureHeader) return false;
    try {
      const computed = crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
      if (computed.length !== signatureHeader.length) return false;
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
    } catch {
      return false;
    }
  }
}

export const moneroo = new MonerooAdapter();

export async function getCurrentSubscription(userId: string) {
  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: userId }, { memberships: { some: { userId } } }] },
  });

  return {
    tier: 'STARTER',
    status: 'ACTIVE',
    shopId: shop?.id || null,
    shopName: shop?.name || null,
    billingInterval: 'MONTHLY',
    amountMinor: 0,
    currency: 'XOF',
    renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    features: ['Vitrine Marchande Gratuite', 'Synchronisation Mobile Basique', 'Support Email'],
  };
}

export async function createSubscriptionCheckout(userId: string, tier = 'PRO', currency = 'XOF') {
  const shop = await prisma.shop.findFirst({
    where: { OR: [{ ownerId: userId }, { memberships: { some: { userId } } }] },
    include: { owner: true },
  });

  const amountMinor = tier === 'ENTERPRISE' ? 4900000 : 1500000;
  const session = await moneroo.createSession({
    shopId: shop?.id || 'default',
    planTier: tier,
    amountMinor,
    currency,
    description: `Abonnement Ojarket ${tier}`,
    customerEmail: shop?.owner?.email || 'marchand@ojarket.com',
    customerName: shop?.owner?.name || 'Marchand Ojarket',
    referenceId: `SUB-${tier}-${Date.now()}`,
  });

  return session;
}

export async function handleMonerooWebhook(rawBody: string, signatureHeader?: string) {
  const isValid = moneroo.verifyWebhookSignature(rawBody, signatureHeader);
  if (!isValid) {
    throw new Error('Signature webhook invalide');
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw new Error('Payload JSON invalide');
  }

  return { received: true, event: event.event || 'payment.success' };
}
