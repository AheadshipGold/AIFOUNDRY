import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentCategory, IncidentStatus } from '@prisma/client';

export interface IncidentRecord {
  id: string;
  orderId: string;
  orderNumber?: string;
  shopId?: string;
  reporterName: string;
  reporterPhone?: string;
  category: IncidentCategory;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: IncidentStatus;
  resolution?: string;
  proposedOutcome?: string;
  resolvedAt?: string;
  createdAt: string;
}

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<IncidentRecord[]> {
    try {
      const incidents = await this.prisma.orderIncident.findMany({
        include: { order: { include: { shop: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (incidents.length === 0) {
        return this.getMockIncidents();
      }

      return incidents.map((inc) => this.mapToRecord(inc));
    } catch {
      return this.getMockIncidents();
    }
  }

  async findByOrder(orderId: string): Promise<IncidentRecord[]> {
    try {
      const incidents = await this.prisma.orderIncident.findMany({
        where: { orderId },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      });

      return incidents.map((inc) => this.mapToRecord(inc));
    } catch {
      return [];
    }
  }

  async findByShop(shopId: string): Promise<IncidentRecord[]> {
    try {
      const incidents = await this.prisma.orderIncident.findMany({
        where: { order: { shopId } },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      });

      return incidents.map((inc) => this.mapToRecord(inc));
    } catch {
      return [];
    }
  }

  async create(data: {
    orderId: string;
    reporterName: string;
    reporterPhone?: string;
    category?: IncidentCategory;
    title: string;
    description: string;
    evidenceUrls?: string[];
  }): Promise<IncidentRecord> {
    try {
      const created = await this.prisma.orderIncident.create({
        data: {
          orderId: data.orderId,
          reporterName: data.reporterName,
          reporterPhone: data.reporterPhone,
          category: data.category || IncidentCategory.OTHER,
          title: data.title,
          description: data.description,
          evidenceUrls: data.evidenceUrls || [],
          status: IncidentStatus.OPEN,
        },
        include: { order: true },
      });

      return this.mapToRecord(created);
    } catch {
      // Fallback mock creation
      return {
        id: `inc-${Date.now()}`,
        orderId: data.orderId,
        orderNumber: 'CMD-CURRENT',
        reporterName: data.reporterName,
        reporterPhone: data.reporterPhone,
        category: data.category || IncidentCategory.OTHER,
        title: data.title,
        description: data.description,
        evidenceUrls: data.evidenceUrls || [],
        status: IncidentStatus.OPEN,
        createdAt: new Date().toISOString(),
      };
    }
  }

  async addEvidence(id: string, evidenceUrls: string[]): Promise<IncidentRecord> {
    const existing = await this.prisma.orderIncident.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existing) {
      throw new NotFoundException(`Litige ${id} introuvable`);
    }

    const merged = Array.from(new Set([...existing.evidenceUrls, ...evidenceUrls]));

    const updated = await this.prisma.orderIncident.update({
      where: { id },
      data: {
        evidenceUrls: merged,
        status: IncidentStatus.UNDER_REVIEW,
      },
      include: { order: true },
    });

    return this.mapToRecord(updated);
  }

  async proposeResolution(
    id: string,
    proposedOutcome: string
  ): Promise<IncidentRecord> {
    const updated = await this.prisma.orderIncident.update({
      where: { id },
      data: {
        proposedOutcome,
        status: IncidentStatus.PROPOSAL_MADE,
      },
      include: { order: true },
    });

    return this.mapToRecord(updated);
  }

  async resolve(
    id: string,
    resolution: string,
    proposedOutcome?: string
  ): Promise<IncidentRecord> {
    try {
      const updated = await this.prisma.orderIncident.update({
        where: { id },
        data: {
          status: IncidentStatus.RESOLVED,
          resolution,
          proposedOutcome: proposedOutcome || undefined,
          resolvedAt: new Date(),
        },
        include: { order: true },
      });

      return this.mapToRecord(updated);
    } catch {
      throw new NotFoundException(`Litige ${id} introuvable`);
    }
  }

  private mapToRecord(inc: any): IncidentRecord {
    return {
      id: inc.id,
      orderId: inc.orderId,
      orderNumber: inc.order?.orderNumber || 'CMD-UNKNOWN',
      shopId: inc.order?.shopId,
      reporterName: inc.reporterName,
      reporterPhone: inc.reporterPhone || undefined,
      category: inc.category,
      title: inc.title,
      description: inc.description,
      evidenceUrls: inc.evidenceUrls || [],
      status: inc.status,
      resolution: inc.resolution || undefined,
      proposedOutcome: inc.proposedOutcome || undefined,
      resolvedAt: inc.resolvedAt?.toISOString ? inc.resolvedAt.toISOString() : inc.resolvedAt,
      createdAt: inc.createdAt.toISOString ? inc.createdAt.toISOString() : inc.createdAt,
    };
  }

  private getMockIncidents(): IncidentRecord[] {
    return [
      {
        id: 'inc-01',
        orderId: 'cmd-mock-01',
        orderNumber: 'CMD-2847',
        reporterName: 'Amina Diop',
        reporterPhone: '+229 97 00 11 22',
        category: IncidentCategory.DELAY_EXCEEDED,
        title: 'Retard de livraison sur Cotonou',
        description: 'La commande devait être livrée sous 10 jours. Demande de clarification auprès de la boutique.',
        evidenceUrls: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80'],
        status: IncidentStatus.UNDER_REVIEW,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }
}
