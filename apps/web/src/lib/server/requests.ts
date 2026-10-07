import { prisma } from './prisma';

export async function getPurchaseRequests(buyerId?: string) {
  const whereClause: any = {};
  if (buyerId) whereClause.buyerId = buyerId;

  const requests = await prisma.purchaseRequest.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    include: {
      buyer: true,
      proposals: { include: { shop: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map((req) => ({
    id: req.id,
    buyerName: req.buyer?.name || 'Client',
    buyerPhone: req.buyer?.phone || undefined,
    title: req.title,
    description: req.description,
    category: req.category,
    targetBudgetMinor: req.targetBudgetMinor,
    currency: req.currency,
    status: req.status,
    aiAnalysis: req.aiStructuredData as any,
    proposals: (req.proposals || []).map((p: any) => ({
      id: p.id,
      requestId: p.requestId,
      shopId: p.shopId,
      shopName: p.shop?.name || 'Boutique Partenaire',
      artisanCity: p.shop?.city || 'Cotonou',
      priceMinor: p.priceMinor,
      advancePaymentRequiredMinor: p.advancePaymentRequiredMinor,
      currency: p.currency,
      productionDays: p.productionDays,
      notes: p.proposalNotes || '',
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
    createdAt: req.createdAt.toISOString(),
  }));
}

export async function createPurchaseRequest(dto: {
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  title: string;
  description: string;
  category?: string;
  targetBudgetMinor?: number;
  aiStructuredData?: any;
}) {
  let buyerId = dto.buyerId;
  if (!buyerId) {
    const user = await prisma.user.create({
      data: {
        email: `guest_${Date.now()}@ojarket.bj`,
        name: dto.buyerName || 'Client Sur-Mesure',
        phone: dto.buyerPhone,
        role: 'BUYER',
        locale: 'fr',
      },
    });
    buyerId = user.id;
  }

  const req = await prisma.purchaseRequest.create({
    data: {
      buyerId,
      title: dto.title,
      description: dto.description,
      category: dto.category || 'leather',
      targetBudgetMinor: dto.targetBudgetMinor || 5000000,
      currency: 'XOF',
      status: 'OPEN',
      aiStructuredData: dto.aiStructuredData || null,
    },
    include: {
      buyer: true,
      proposals: { include: { shop: true } },
    },
  });

  return {
    id: req.id,
    buyerName: req.buyer?.name || 'Client',
    title: req.title,
    description: req.description,
    category: req.category,
    targetBudgetMinor: req.targetBudgetMinor,
    currency: req.currency,
    status: req.status,
    createdAt: req.createdAt.toISOString(),
  };
}
