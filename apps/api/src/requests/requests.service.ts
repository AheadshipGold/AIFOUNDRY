import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StructuredAiExtraction {
  refinedTitle: string;
  category: string;
  materials: string[];
  estimatedDays: number;
  priceEstimateFCFA: number;
  targetBoutiques: string[];
}

export interface SellerProposalItem {
  id: string;
  requestId: string;
  shopId: string;
  shopName: string;
  artisanCity: string;
  priceMinor: number;
  advancePaymentRequiredMinor: number;
  currency: string;
  productionDays: number;
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  title: string;
  description: string;
  category: string;
  targetBudgetMinor: number;
  currency: string;
  maxDeliveryDate?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'MATCHED' | 'FULFILLED' | 'CLOSED' | 'EXPIRED';
  aiAnalysis?: StructuredAiExtraction;
  proposals: SellerProposalItem[];
  createdAt: string;
}

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapProposalToItem(proposal: any): SellerProposalItem {
    return {
      id: proposal.id,
      requestId: proposal.requestId,
      shopId: proposal.shopId,
      shopName: proposal.shop?.name || 'Unknown Shop',
      artisanCity: proposal.shop?.city || 'Unknown City',
      priceMinor: proposal.priceMinor,
      advancePaymentRequiredMinor: proposal.advancePaymentRequiredMinor,
      currency: proposal.currency,
      productionDays: proposal.productionDays,
      notes: proposal.proposalNotes || '',
      status: proposal.status as any,
      createdAt: proposal.createdAt.toISOString(),
    };
  }

  private mapRequestToItem(req: any): PurchaseRequestItem {
    return {
      id: req.id,
      buyerName: req.buyer?.name || 'Unknown Buyer',
      buyerPhone: req.buyer?.phone || undefined,
      title: req.title,
      description: req.description,
      category: req.category,
      targetBudgetMinor: req.targetBudgetMinor,
      currency: req.currency,
      status: req.status as any,
      aiAnalysis: req.aiStructuredData ? (req.aiStructuredData as any) as StructuredAiExtraction : undefined,
      proposals: req.proposals ? req.proposals.map((p: any) => this.mapProposalToItem(p)) : [],
      createdAt: req.createdAt.toISOString(),
    };
  }

  async findAll(): Promise<PurchaseRequestItem[]> {
    const requests = await this.prisma.purchaseRequest.findMany({
      include: {
        buyer: true,
        proposals: {
          include: {
            shop: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(req => this.mapRequestToItem(req));
  }

  async findById(id: string): Promise<PurchaseRequestItem> {
    const req = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        buyer: true,
        proposals: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!req) {
      throw new NotFoundException(`Request ${id} not found`);
    }

    return this.mapRequestToItem(req);
  }

  async create(dto: {
    buyerName: string;
    buyerPhone?: string;
    rawPrompt: string;
    category?: string;
    budgetMinor?: number;
  }): Promise<PurchaseRequestItem> {
    let user = await this.prisma.user.findFirst({
      where: { phone: dto.buyerPhone || '+229 97 00 00 00' },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: dto.buyerName || 'Client Particulier',
          phone: dto.buyerPhone || '+229 97 00 00 00',
          email: `client_${Date.now()}@example.com`,
          role: 'BUYER',
          locale: 'fr',
        },
      });
    }

    const isJewelry = /bijou|collier|bague|bronze|or/i.test(dto.rawPrompt);
    const isFurniture = /table|meuble|console|bois|iroko/i.test(dto.rawPrompt);
    const cat = dto.category || (isJewelry ? 'joaillerie' : isFurniture ? 'mobilier' : 'maroquinerie');
    const budget = dto.budgetMinor || (isJewelry ? 30000000 : isFurniture ? 50000000 : 18000000);

    const aiAnalysis = {
      refinedTitle: `Création Sur-Mesure : ${cat.toUpperCase()}`,
      category: cat,
      materials: cat === 'maroquinerie' ? ['Cuir pleine fleur', 'Bouclerie laiton'] : ['Matière noble sélectionnée'],
      estimatedDays: 10,
      priceEstimateFCFA: Math.round(budget / 100),
      targetBoutiques: ['Maison Ganvié & Fils', "Fonderie Royale d'Abomey"],
    };

    const newReq = await this.prisma.purchaseRequest.create({
      data: {
        buyerId: user.id,
        title: dto.rawPrompt.length > 50 ? `${dto.rawPrompt.slice(0, 47)}...` : dto.rawPrompt,
        description: dto.rawPrompt,
        category: cat,
        targetBudgetMinor: budget,
        currency: 'XOF',
        status: 'OPEN',
        aiStructuredData: aiAnalysis,
      },
      include: {
        buyer: true,
        proposals: {
          include: {
            shop: true,
          },
        },
      },
    });

    return this.mapRequestToItem(newReq);
  }

  async addProposal(requestId: string, dto: {
    shopId?: string;
    shopName: string;
    artisanCity?: string;
    priceMinor: number;
    advancePaymentRequiredMinor?: number;
    productionDays: number;
    notes: string;
  }): Promise<SellerProposalItem> {
    const req = await this.prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });

    if (!req) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    let shop;
    if (dto.shopId) {
      shop = await this.prisma.shop.findUnique({ where: { id: dto.shopId } });
    } else {
      shop = await this.prisma.shop.findFirst({ where: { name: dto.shopName } });
    }

    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    const proposal = await this.prisma.sellerProposal.create({
      data: {
        requestId,
        shopId: shop.id,
        priceMinor: dto.priceMinor,
        advancePaymentRequiredMinor: dto.advancePaymentRequiredMinor || Math.round(dto.priceMinor * 0.4),
        currency: 'XOF',
        productionDays: dto.productionDays,
        proposalNotes: dto.notes,
        status: 'PENDING',
      },
      include: {
        shop: true,
      },
    });

    await this.prisma.purchaseRequest.update({
      where: { id: requestId },
      data: { status: 'MATCHED' },
    });

    return this.mapProposalToItem(proposal);
  }

  async acceptProposal(requestId: string, proposalId: string) {
    const req = await this.prisma.purchaseRequest.findUnique({
      where: { id: requestId },
      include: {
        proposals: true,
        buyer: true,
      },
    });

    if (!req) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const prop = req.proposals.find(p => p.id === proposalId);
    if (!prop) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }

    await this.prisma.$transaction([
      this.prisma.sellerProposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
      }),
      this.prisma.sellerProposal.updateMany({
        where: { requestId, id: { not: proposalId } },
        data: { status: 'DECLINED' },
      }),
      this.prisma.purchaseRequest.update({
        where: { id: requestId },
        data: { status: 'FULFILLED' },
      }),
    ]);

    const orderRef = `OJK-D02-${Date.now().toString().slice(-4)}`;
    
    await this.prisma.order.create({
      data: {
        shopId: prop.shopId,
        buyerId: req.buyerId,
        orderNumber: orderRef,
        totalAmountMinor: prop.priceMinor,
        grossSaleAmountMinor: prop.priceMinor,
        amountReceivedMinor: 0,
        amountOutstandingMinor: prop.priceMinor,
        currency: prop.currency || 'XOF',
        paymentStatus: 'PENDING',
        verificationSource: 'UNKNOWN',
        fulfillmentStatus: 'PENDING',
        paymentChannel: 'DIRECT_TRANSFER',
      },
    });

    // Refresh request with updated statuses
    const updatedReq = await this.findById(requestId);
    const acceptedProposal = updatedReq.proposals.find(p => p.id === proposalId);

    return {
      success: true,
      message: 'Devis sur-mesure accepté avec succès. Commande formelle créée.',
      orderNumber: orderRef,
      acceptedProposal,
      request: updatedReq,
    };
  }
}
