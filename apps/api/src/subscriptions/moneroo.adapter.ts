import * as crypto from 'crypto';

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

export interface PaymentSessionResult {
  referenceId: string;
  checkoutUrl: string;
  redirectRequired: boolean;
  status: string;
  providerRawResponse?: any;
  instructions: string;
  isSandbox: boolean;
}

export interface ParsedWebhookPayment {
  isValid: boolean;
  referenceId: string;
  externalTransactionId: string;
  shopId: string;
  planTier: string;
  billingInterval: string;
  amountPaid: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  signatureMatches: boolean;
  rawEvent: any;
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

  private formatSecureReturnUrl(returnUrl?: string, referenceId?: string): string {
    const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ojarket.com';
    if (!returnUrl) {
      return `${defaultUrl}/seller/subscription?status=success&ref=${referenceId}`;
    }

    if (returnUrl.startsWith('http://')) {
      try {
        const parsed = new URL(returnUrl);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          return `${defaultUrl}${parsed.pathname}${parsed.search}`;
        }
        return returnUrl.replace(/^http:\/\//i, 'https://');
      } catch {
        return `${defaultUrl}/seller/subscription?status=success&ref=${referenceId}`;
      }
    }

    return returnUrl;
  }

  async createSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    const { shopId, planTier, amountMinor, currency, description, customerEmail, customerName, customerPhone, returnUrl, referenceId, billingInterval } = params;
    const secureReturnUrl = this.formatSecureReturnUrl(returnUrl, referenceId);

    // Convert minor units to major units for Moneroo (e.g. 1500000 -> 15000 FCFA)
    const amountMajor = Math.round(amountMinor / 100);

    if (!this.isConfigured()) {
      // Simulation locale sandbox / démo si aucune clé n'est encore configurée
      console.warn('[MonerooAdapter] Mode simulation actif (clés API non renseignées).');
      return {
        referenceId,
        checkoutUrl: `/seller/subscription?status=simulated&plan=${planTier}&ref=${referenceId}`,
        redirectRequired: true,
        status: 'SIMULATED',
        instructions: 'Environnement de démonstration : simulation du paiement Mobile Money acceptée.',
        isSandbox: true,
      };
    }

    const nameParts = (customerName || 'Vendeur Ojarket').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Vendeur';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Ojarket';

    const payload: Record<string, unknown> = {
      amount: amountMajor,
      currency: currency || 'XOF',
      description: description || `Ojarket - Abonnement Marchand ${planTier}`,
      customer: {
        email: customerEmail,
        first_name: firstName,
        last_name: lastName,
        phone: customerPhone || undefined,
      },
      return_url: secureReturnUrl,
      metadata: {
        shopId,
        planTier,
        billingInterval: billingInterval || 'MONTHLY',
        referenceId,
      },
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
      const errorData = (await response.json().catch(() => ({}))) as Record<string, any>;
      console.error('[MonerooAdapter] Erreur création session Moneroo:', response.status, errorData);
      throw new Error(`Échec Moneroo API (${response.status}): ${errorData.message || errorData.error || 'Erreur passerelle'}`);
    }

    const data = await response.json();
    const checkoutUrl = data?.data?.checkout_url || data?.checkout_url || data?.payment_url;

    if (!checkoutUrl) {
      throw new Error("Moneroo n'a pas retourné de lien de paiement valide pour cette transaction.");
    }

    return {
      referenceId,
      checkoutUrl,
      redirectRequired: true,
      status: 'PENDING',
      providerRawResponse: data,
      instructions: 'Veuillez finaliser le paiement sur votre mobile (MTN MoMo, Moov Money, Wave, Orange Money).',
      isSandbox: false,
    };
  }

  async verifyPaymentWithProvider(paymentId: string): Promise<{ success: boolean; status: string; amount?: number; currency?: string; metadata?: Record<string, any> }> {
    if (!this.apiKey) {
      return { success: false, status: 'UNCONFIGURED' };
    }

    try {
      let response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}/verify`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (response.status === 404 || !response.ok) {
        response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        });
      }

      if (!response.ok) {
        return { success: false, status: 'ERROR' };
      }

      const res = await response.json();
      const paymentData = res.data || res;
      const rawStatus = String(paymentData.status || '').trim().toUpperCase();
      const isPaid = rawStatus === 'SUCCESS' || rawStatus === 'PAID' || rawStatus === 'COMPLETED' || rawStatus === 'SUCCEEDED';

      return {
        success: isPaid,
        status: rawStatus || 'PENDING',
        amount: Number(paymentData.amount || 0),
        currency: paymentData.currency,
        metadata: paymentData.metadata || undefined,
      };
    } catch (err) {
      console.error('[MonerooAdapter] Erreur vérification directe:', err);
      return { success: false, status: 'ERROR' };
    }
  }

  verifySignature(headers: Record<string, any>, rawBody: string): boolean {
    if (!this.webhookSecret) {
      return process.env.NODE_ENV !== 'production';
    }

    const signature =
      headers['x-moneroo-signature'] ||
      headers['x-moonero-signature'] ||
      headers['moneroo-signature'] ||
      headers['x-signature'];

    if (!signature) {
      return false;
    }

    try {
      const computed = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      const bufA = Buffer.from(signature);
      const bufB = Buffer.from(computed);

      if (bufA.length !== bufB.length) {
        return false;
      }

      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  parseWebhookPayload(
    payload: Record<string, any>,
    rawBody: string,
    headers: Record<string, any>
  ): ParsedWebhookPayment {
    const signatureMatches = this.verifySignature(headers, rawBody);
    const event = payload.event || payload.type || 'payment.success';
    const data = payload.data || payload;
    const metadata = data.metadata || {};

    const referenceId = data.reference_id || data.referenceId || payload.referenceId || '';
    const externalTransactionId = data.transaction_id || data.id || '';
    const shopId = metadata.shopId || '';
    const planTier = metadata.planTier || 'ATELIER_PRO';
    const billingInterval = metadata.billingInterval || 'MONTHLY';
    const amountPaid = Number(data.amount || payload.amount || 0);
    const currency = data.currency || payload.currency || 'XOF';

    const isSuccessful =
      event === 'payment.success' ||
      data.status === 'SUCCESS' ||
      data.status === 'PAID' ||
      data.status === 'COMPLETED';

    return {
      isValid: Boolean(referenceId && shopId && amountPaid > 0),
      referenceId,
      externalTransactionId,
      shopId,
      planTier,
      billingInterval,
      amountPaid,
      currency,
      status: isSuccessful ? 'SUCCESS' : 'FAILED',
      signatureMatches,
      rawEvent: payload,
    };
  }
}

export const monerooAdapter = new MonerooAdapter();
