// ==============================================================================
// TYPAGES NORMATIFS D01 + D02 V3 — IMPLEMENTATION READY
// ==============================================================================

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN' | 'OPERATOR';

export type PaymentChannel =
  | 'MTN_MOMO'
  | 'MOOV_MONEY'
  | 'CELTIIS_CASH'
  | 'CARD'
  | 'DIRECT_TRANSFER'
  | 'CASH_ON_DELIVERY'
  | 'PICKUP';

export type PaymentStatus =
  | 'NOT_STARTED'
  | 'DECLARED'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'REVIEW_REQUIRED';

export type VerificationSource =
  | 'PROVIDER'
  | 'SELLER_MANUAL'
  | 'COD'
  | 'PICKUP'
  | 'BANK_MANUAL'
  | 'UNKNOWN';

export type FulfillmentStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'CANCELLED';

export type RequestStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'MATCHED'
  | 'FULFILLED'
  | 'CLOSED'
  | 'EXPIRED';

export type ProposalStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED';

export type FinancialEventType =
  | 'SALE_CREATED'
  | 'PAYMENT_DECLARED'
  | 'PAYMENT_CONFIRMED'
  | 'PARTIAL_PAYMENT_CONFIRMED'
  | 'COD_COLLECTED'
  | 'REFUND_REQUESTED'
  | 'REFUND_CONFIRMED'
  | 'ADJUSTMENT_POSTED'
  | 'DAY_CLOSED';

export interface FinancialEvent {
  id: string;
  shopId: string;
  orderId?: string;
  eventType: FinancialEventType;
  amountMinor: number;
  currency: string;
  source: VerificationSource;
  channel: PaymentChannel;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface DayClosure {
  id: string;
  shopId: string;
  closureDate: string;
  totalVenduMinor: number;
  totalEncaisseMinor: number;
  totalRestantMinor: number;
  varianceMinor: number;
  status: 'BALANCED' | 'VARIANCE_REPORTED';
  closedBy: string;
  breakdown: Record<string, number>;
  auditNotes?: string;
  closedAt: string;
}

export interface SellerProposal {
  id: string;
  requestId: string;
  shopId: string;
  shopName: string;
  artisanCity: string;
  priceMinor: number;
  advancePaymentRequiredMinor: number;
  currency: string;
  productionDays: number;
  proposalNotes: string;
  status: ProposalStatus;
  createdAt: string;
}

export interface PurchaseRequest {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  title: string;
  description: string;
  category: string;
  targetBudgetMinor: number;
  currency: string;
  maxDeliveryDate?: string;
  status: RequestStatus;
  proposals: SellerProposal[];
  createdAt: string;
}

export interface OrderItemLine {
  variantId: string;
  itemTitle: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  isDigital: boolean;
  grossSaleAmountMinor: number;
  amountReceivedMinor: number;
  amountOutstandingMinor: number;
  refundAmountMinor: number;
  netCollectedMinor: number;
  currency: string;
  paymentChannel: PaymentChannel;
  paymentStatus: PaymentStatus;
  verificationSource: VerificationSource;
  fulfillmentStatus: FulfillmentStatus;
  lines: OrderItemLine[];
  createdAt: string;
}
