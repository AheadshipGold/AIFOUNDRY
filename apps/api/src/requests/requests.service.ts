import { Injectable, NotFoundException } from '@nestjs/common';

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
  shopName: string;
  priceMinor: number;
  currency: string;
  productionDays: number;
  notes: string;
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
  status: 'OPEN' | 'MATCHED' | 'CLOSED';
  aiAnalysis?: StructuredAiExtraction;
  proposals: SellerProposalItem[];
  createdAt: string;
}

@Injectable()
export class RequestsService {
  private requests: PurchaseRequestItem[] = [
    {
      id: 'req-01',
      buyerName: 'Amina Diop',
      buyerPhone: '+229 97 00 11 22',
      title: 'Parure royale en bronze ciselé pour cérémonie traditionnelle',
      description: 'Recherche d\'un atelier d\'artisan d\'Abomey capable de forger un collier plastron et manchettes assorties sous 15 jours avec symboles royaux.',
      category: 'joaillerie',
      targetBudgetMinor: 28000000,
      currency: 'XOF',
      status: 'MATCHED',
      aiAnalysis: {
        refinedTitle: 'Parure Royale Cire Perdue — Bronze d\'Apparat',
        category: 'joaillerie',
        materials: ['Bronze noble', 'Cire d\'abeille', 'Finition antique'],
        estimatedDays: 14,
        priceEstimateFCFA: 280000,
        targetBoutiques: ['Fonderie Royale d\'Abomey', 'Ateliers d\'Honneur'],
      },
      proposals: [
        {
          id: 'prop-01',
          requestId: 'req-01',
          shopName: 'Fonderie Royale d\'Abomey',
          priceMinor: 27500000,
          currency: 'XOF',
          productionDays: 12,
          notes: 'Faisable sous 12 jours. Ébauche envoyée par WhatsApp après confirmation du versement direct MoMo.',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    }
  ];

  findAll(): PurchaseRequestItem[] {
    return this.requests;
  }

  findById(id: string): PurchaseRequestItem {
    const r = this.requests.find(item => item.id === id);
    if (!r) throw new NotFoundException(`Request ${id} not found`);
    return r;
  }

  create(dto: {
    buyerName: string;
    buyerPhone?: string;
    rawPrompt: string;
    category?: string;
    budgetMinor?: number;
  }): PurchaseRequestItem {
    const isJewelry = /bijou|collier|bague|bronze|or/i.test(dto.rawPrompt);
    const isFurniture = /table|meuble|console|bois|iroko/i.test(dto.rawPrompt);
    const cat = dto.category || (isJewelry ? 'joaillerie' : isFurniture ? 'mobilier' : 'maroquinerie');
    const budget = dto.budgetMinor || (isJewelry ? 30000000 : isFurniture ? 50000000 : 18000000);

    const newReq: PurchaseRequestItem = {
      id: `req-${Date.now().toString().slice(-4)}`,
      buyerName: dto.buyerName || 'Client Particulier',
      buyerPhone: dto.buyerPhone || '+229 97 00 00 00',
      title: dto.rawPrompt.length > 50 ? `${dto.rawPrompt.slice(0, 47)}...` : dto.rawPrompt,
      description: dto.rawPrompt,
      category: cat,
      targetBudgetMinor: budget,
      currency: 'XOF',
      status: 'OPEN',
      aiAnalysis: {
        refinedTitle: `Création Sur-Mesure : ${cat.toUpperCase()}`,
        category: cat,
        materials: cat === 'maroquinerie' ? ['Cuir pleine fleur', 'Bouclerie laiton'] : ['Matière noble sélectionnée'],
        estimatedDays: 10,
        priceEstimateFCFA: Math.round(budget / 100),
        targetBoutiques: ['Maison Ganvié & Fils', 'Fonderie Royale d\'Abomey'],
      },
      proposals: [],
      createdAt: new Date().toISOString(),
    };

    this.requests.unshift(newReq);
    return newReq;
  }

  addProposal(requestId: string, dto: {
    shopName: string;
    priceMinor: number;
    productionDays: number;
    notes: string;
  }): SellerProposalItem {
    const req = this.findById(requestId);
    const newProp: SellerProposalItem = {
      id: `prop-${Date.now().toString().slice(-4)}`,
      requestId,
      shopName: dto.shopName,
      priceMinor: dto.priceMinor,
      currency: 'XOF',
      productionDays: dto.productionDays,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };
    req.proposals.push(newProp);
    req.status = 'MATCHED';
    return newProp;
  }
}
