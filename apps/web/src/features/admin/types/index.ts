export interface CorridorRule {
  id: string;
  country: string;
  countryCode: string;
  currency: string;
  channel: string;
  channelCode?: string;
  isEnabled: boolean;
  minAmountMinor: number;
  maxAmountMinor: number;
  kycRequired: string;
  contractVerified: boolean;
}

export interface ShopReview {
  id: string;
  name: string;
  owner: string;
  city: string;
  country: string;
  craft: string;
  status: "VERIFIED" | "PENDING_KYC" | "SUSPENDED";
  joinedDate: string;
  salesCount: number;
  documentType: string;
}

export interface DisputeItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  reporterName: string;
  reporterPhone?: string;
  category: string;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: "OPEN" | "UNDER_REVIEW" | "PROPOSAL_MADE" | "RESOLVED" | string;
  proposedOutcome?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  target: string;
  operator: string;
  role: string;
  time: string;
  ip: string;
  status: "SUCCESS" | "BLOCKED" | "REVIEW";
  hash?: string;
  previousHash?: string;
}

export interface SealedAuditReport {
  id: string;
  reportPeriod: string;
  generatedAt: string;
  totalEventsCount: number;
  totalOrdersVolumeMinor: number;
  activeShopsCount: number;
  resolvedDisputesCount: number;
  activeCorridorsCount: number;
  merkleRootHash: string;
  isCryptographicallySealed: boolean;
  signatureSeal: string;
}

export interface ChainIntegrityResult {
  isValid: boolean;
  totalBlocks: number;
  genesisHash: string;
  latestHash: string;
  verifiedAt: string;
}
