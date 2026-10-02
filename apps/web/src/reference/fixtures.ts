import type { PaymentSource, PaymentStatus } from "@aifoundry/design-system";
// Only imported by the development-only references. Not API contracts.
export const referenceSummary = {
  sold: 500000,
  received: 200000,
  outstanding: 300000,
  refunded: 0,
  currency: "XOF",
};
export const referenceOrders: {
  id: string;
  customer: string;
  amount: number;
  status: PaymentStatus;
  source: PaymentSource;
}[] = [
  {
    id: "DEMO-021",
    customer: "Client A",
    amount: 45000,
    status: "CONFIRMED",
    source: "SELLER_MANUAL",
  },
  {
    id: "DEMO-022",
    customer: "Client B",
    amount: 80000,
    status: "CONFIRMED",
    source: "PROVIDER",
  },
  {
    id: "DEMO-023",
    customer: "Client C",
    amount: 25000,
    status: "DECLARED",
    source: "UNKNOWN",
  },
];
export const reconciliation = [
  {
    method: "direct",
    expected: 85000,
    confirmed: 80000,
    source: "SELLER_MANUAL",
  },
  {
    method: "cash",
    expected: 40000,
    confirmed: 40000,
    source: "SELLER_MANUAL",
  },
  {
    method: "automated",
    expected: 80000,
    confirmed: 80000,
    source: "PROVIDER",
  },
] as const;
