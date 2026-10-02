import { Locale, Theme, ThemeMode } from "./tokens";
import { MessageKey } from "./messages";
export type Tone = "neutral" | "success" | "pending" | "error";
export type PaymentStatus =
  | "NOT_STARTED"
  | "DECLARED"
  | "PENDING"
  | "PARTIALLY_PAID"
  | "CONFIRMED"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "CANCELLED"
  | "REVIEW_REQUIRED";
export type PaymentSource =
  "PROVIDER" | "SELLER_MANUAL" | "COD" | "PICKUP" | "BANK_MANUAL" | "UNKNOWN";
export const paymentStatuses: Record<
  PaymentStatus,
  { label: MessageKey; tone: Tone }
> = {
  NOT_STARTED: { label: "notStarted", tone: "neutral" },
  DECLARED: { label: "declared", tone: "pending" },
  PENDING: { label: "pending", tone: "pending" },
  PARTIALLY_PAID: { label: "partial", tone: "pending" },
  CONFIRMED: { label: "confirmed", tone: "neutral" },
  FAILED: { label: "failed", tone: "error" },
  REFUND_PENDING: { label: "refundPending", tone: "pending" },
  REFUNDED: { label: "refunded", tone: "neutral" },
  CANCELLED: { label: "cancelled", tone: "neutral" },
  REVIEW_REQUIRED: { label: "review", tone: "error" },
};
// Presentation descriptors only; the server owns verification and transitions.
export const paymentSources: Record<
  PaymentSource,
  { label: MessageKey; tone: Tone; symbol: string; outline: boolean }
> = {
  PROVIDER: { label: "provider", tone: "success", symbol: "✓", outline: false },
  SELLER_MANUAL: {
    label: "seller",
    tone: "neutral",
    symbol: "○",
    outline: true,
  },
  COD: { label: "delivery", tone: "pending", symbol: "↗", outline: true },
  PICKUP: { label: "pickup", tone: "pending", symbol: "↗", outline: true },
  BANK_MANUAL: {
    label: "bankManual",
    tone: "neutral",
    symbol: "○",
    outline: true,
  },
  UNKNOWN: { label: "unknown", tone: "pending", symbol: "?", outline: true },
};
export const orderStatuses = {
  CREATED: "created",
  ACCEPTED: "accepted",
  PREPARING: "preparing",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
} as const;
export const syncStatuses = {
  LOCAL_PENDING_SYNC: "local",
  SYNCING: "syncing",
  CONFLICT: "conflict",
  SYNCED: "synced",
} as const;
export interface Money {
  amountMinor: number;
  currency: string;
}
export interface MoneySummary {
  currency: string;
  sold: number;
  received: number;
  outstanding: number;
  refunded: number;
}
export interface ProductPreview {
  id: string;
  title: string;
  shop: string;
  amountMinor: number;
  currency: string;
  availability: "available" | "onOrder" | "toConfirm" | "soldOut" | "digital";
  image?: string;
}
export function formatMoney(
  { amountMinor, currency }: Money,
  locale: Locale,
): string {
  if (!Number.isSafeInteger(amountMinor))
    throw new RangeError("Money requires safe integer minor units");
  if (!/^[A-Z]{3}$/.test(currency))
    throw new RangeError("Currency requires an uppercase ISO code");
  const formatter = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(amountMinor / 10 ** digits);
}
export function resolveTheme(mode: ThemeMode, system: Theme): Theme {
  return mode === "system" ? system : mode;
}
export function parsePreferences(value: string | null): {
  locale: Locale;
  mode: ThemeMode;
} {
  try {
    const data: unknown = JSON.parse(value ?? "null");
    if (
      data &&
      typeof data === "object" &&
      "locale" in data &&
      "mode" in data
    ) {
      return {
        locale: data.locale === "en" ? "en" : "fr",
        mode:
          data.mode === "light" || data.mode === "dark" ? data.mode : "system",
      };
    }
  } catch {
    /* Invalid local preference safely falls back. */
  }
  return { locale: "fr", mode: "system" };
}
