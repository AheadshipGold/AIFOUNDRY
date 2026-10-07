import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StructuredAiExtraction {
  refinedTitle: string;
  category: string;
  materials: string[];
  estimatedDays: number;
  priceEstimateFCFA: number;
  deliveryEstimate?: string;
  targetBoutiques: string[];
  technicalSummary?: string;
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

  async findAll(buyerId?: string): Promise<PurchaseRequestItem[]> {
    const whereClause: any = {};
    if (buyerId) {
      whereClause.buyerId = buyerId;
    }

    const requests = await this.prisma.purchaseRequest.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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

  aiAnalyze(rawPrompt: string): StructuredAiExtraction {
    const prompt = (rawPrompt || '').trim();
    const promptLower = prompt.toLowerCase();

    // Detect category
    let category = 'maroquinerie';
    if (/bijou|collier|bague|bronze|or\b|argent|bracelet|parure|pendentif/i.test(promptLower)) {
      category = 'jewelry';
    } else if (/montre|horlog|chrono|cadran|mouvement|automatique|rolex/i.test(promptLower)) {
      category = 'watches';
    } else if (/table|meuble|console|bois|iroko|fauteuil|chaise|mobilier|ébénist/i.test(promptLower)) {
      category = 'home';
    } else if (/sac|tote|cuir|portefeuille|ceinture|maroquin|valise|besace/i.test(promptLower)) {
      category = 'leather';
    } else if (/soie|tissu|lin|robe|vêtement|habit|textile|couture/i.test(promptLower)) {
      category = 'fashion';
    } else if (/sculpture|statue|art|peinture|tableau|toile/i.test(promptLower)) {
      category = 'art';
    }

    // Material detection
    const materials: string[] = [];
    if (/cuir|veau|tannage/i.test(promptLower)) materials.push('Cuir pleine fleur tannage végétal');
    if (/laiton|bouclerie/i.test(promptLower)) materials.push('Bouclerie en laiton massif brossé');
    if (/or\b/i.test(promptLower)) materials.push('Or 18 carats certifié');
    if (/argent/i.test(promptLower)) materials.push('Argent 925 sterling');
    if (/bronze/i.test(promptLower)) materials.push('Bronze noble à la cire perdue');
    if (/iroko|bois|ébène/i.test(promptLower)) materials.push("Bois d'Iroko noble massif séché");
    if (/soie/i.test(promptLower)) materials.push('Soie naturelle tissée main');
    if (/verre|saphir/i.test(promptLower)) materials.push('Verre saphir inrayable');
    if (materials.length === 0) {
      if (category === 'leather' || category === 'maroquinerie') materials.push('Cuir sélectionné premium', 'Finitions sellier');
      else if (category === 'jewelry') materials.push('Métaux précieux et alliages nobles');
      else if (category === 'watches') materials.push('Acier 316L et verre saphir');
      else if (category === 'home') materials.push('Bois massifs et finitions satinées');
      else materials.push('Matériaux nobles sélectionnés par nos maîtres artisans');
    }

    // Price extraction from prompt if present (e.g. 50000, 150 000, 80k)
    let priceEstimateFCFA = 65000;
    const priceMatch = prompt.match(/(\d+[\s\d]*)\s*(?:fcfa|f cfa|cfa|xof|k|€|\$)?/i);
    if (priceMatch) {
      const parsedNum = parseInt(priceMatch[1].replace(/\s+/g, ''), 10);
      if (parsedNum >= 5000 && parsedNum <= 100000000) {
        priceEstimateFCFA = parsedNum;
      }
    } else {
      if (category === 'watches') priceEstimateFCFA = 180000;
      else if (category === 'jewelry') priceEstimateFCFA = 120000;
      else if (category === 'home') priceEstimateFCFA = 350000;
      else if (category === 'leather' || category === 'maroquinerie') priceEstimateFCFA = 75000;
      else if (category === 'art') priceEstimateFCFA = 220000;
      else priceEstimateFCFA = 50000;
    }

    // Refined noble title
    let refinedTitle = prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt;
    if (prompt.length > 5) {
      const words = prompt.split(/\s+/).slice(0, 6).join(' ');
      refinedTitle = words.charAt(0).toUpperCase() + words.slice(1);
    } else {
      refinedTitle = `Création Sur-Mesure (${category.toUpperCase()})`;
    }

    // Target ateliers
    const targetBoutiques = [
      'Maison Ganvié & Fils (Atelier Cotonou)',
      "Fonderie Royale d'Abomey",
      'Maison Laurent – Maroquinerie d’Exception',
    ];

    const estimatedDays = category === 'home' ? 15 : category === 'jewelry' ? 10 : 7;

    return {
      refinedTitle,
      category,
      materials,
      estimatedDays,
      priceEstimateFCFA,
      deliveryEstimate: `${estimatedDays} à ${estimatedDays + 4} jours ouvrés`,
      targetBoutiques,
      technicalSummary: `Spécification technique structurée pour atelier : finitions haut de gamme, matériaux certifiés, contrôle qualité avant livraison.`,
    };
  }

  async create(dto: {
    buyerId?: string;
    buyerName: string;
    buyerPhone?: string;
    rawPrompt: string;
    category?: string;
    budgetMinor?: number;
  }): Promise<PurchaseRequestItem> {
    let user = dto.buyerId
      ? await this.prisma.user.findUnique({ where: { id: dto.buyerId } })
      : null;

    if (!user && dto.buyerPhone) {
      user = await this.prisma.user.findFirst({
        where: { phone: dto.buyerPhone },
      });
    }

    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { phone: '+229 97 00 00 00' },
      });
    }

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

    const aiAnalysis = this.aiAnalyze(dto.rawPrompt);
    const cat = dto.category || aiAnalysis.category;
    const budget = dto.budgetMinor || (aiAnalysis.priceEstimateFCFA * 100);

    const newReq = await this.prisma.purchaseRequest.create({
      data: {
        buyerId: user.id,
        title: aiAnalysis.refinedTitle || (dto.rawPrompt.length > 50 ? `${dto.rawPrompt.slice(0, 47)}...` : dto.rawPrompt),
        description: dto.rawPrompt,
        category: cat,
        targetBudgetMinor: budget,
        currency: 'XOF',
        status: 'OPEN',
        aiStructuredData: aiAnalysis as any,
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
