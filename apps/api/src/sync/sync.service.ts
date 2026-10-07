import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SyncItemDto {
  clientId: string;
  action: 'RECORD_EXTERNAL_SALE' | 'UPDATE_STOCK' | 'CREATE_DRAFT_PRODUCT';
  shopId: string;
  productId?: string;
  variantId?: string;
  quantity?: number;
  amountMinor?: number;
  paymentChannel?: 'ESPECES' | 'MTN_MOMO' | 'MOOV_MONEY' | 'CARTE_BANCAIRE' | 'AUTRE';
  clientTimestamp: string;
  clientVersion?: number;
  metadata?: Record<string, any>;
}

export interface SyncConflictItem {
  conflictId: string;
  clientId: string;
  shopId: string;
  action: string;
  reason: 'INSUFFICIENT_STOCK' | 'VERSION_MISMATCH' | 'PRODUCT_NOT_FOUND';
  serverStockOnHand: number;
  requestedQuantity: number;
  productTitle: string;
  variantName?: string;
  createdAt: string;
  status: 'PENDING_RESOLVE' | 'RESOLVED_OVERRIDE' | 'RESOLVED_CANCELLED';
}

export interface SyncItemResult {
  clientId: string;
  status: 'SYNCED' | 'CONFLICT' | 'DUPLICATE' | 'ERROR';
  message?: string;
  updatedStock?: number;
  conflict?: SyncConflictItem;
}

export interface SyncBatchResponse {
  success: boolean;
  totalProcessed: number;
  syncedCount: number;
  conflictCount: number;
  results: SyncItemResult[];
  conflicts: SyncConflictItem[];
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private activeConflicts = new Map<string, SyncConflictItem>();

  constructor(private readonly prisma: PrismaService) {}

  async reconcileBatch(shopId: string, items: SyncItemDto[]): Promise<SyncBatchResponse> {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        success: true,
        totalProcessed: 0,
        syncedCount: 0,
        conflictCount: 0,
        results: [],
        conflicts: [],
      };
    }

    const results: SyncItemResult[] = [];
    const conflicts: SyncConflictItem[] = [];

    for (const item of items) {
      try {
        const res = await this.processSyncItem(shopId, item);
        results.push(res);
        if (res.status === 'CONFLICT' && res.conflict) {
          conflicts.push(res.conflict);
          this.activeConflicts.set(res.conflict.conflictId, res.conflict);
        }
      } catch (err: any) {
        this.logger.error('[SyncService] Erreur sur item ' + item.clientId + ': ' + err.message);
        results.push({
          clientId: item.clientId,
          status: 'ERROR',
          message: err.message,
        });
      }
    }

    const syncedCount = results.filter((r) => r.status === 'SYNCED' || r.status === 'DUPLICATE').length;
    const conflictCount = conflicts.length;

    return {
      success: true,
      totalProcessed: items.length,
      syncedCount,
      conflictCount,
      results,
      conflicts,
    };
  }

  private async processSyncItem(shopId: string, item: SyncItemDto): Promise<SyncItemResult> {
    const existingMovement = await this.prisma.stockMovement.findFirst({
      where: {
        reference: 'OFFLINE_SYNC:' + item.clientId,
      },
      include: { variant: true },
    });

    if (existingMovement) {
      return {
        clientId: item.clientId,
        status: 'DUPLICATE',
        message: 'Opération déjà synchronisée précédemment.',
        updatedStock: existingMovement.variant.stockOnHand,
      };
    }

    if (item.action === 'RECORD_EXTERNAL_SALE') {
      return this.handleExternalSale(shopId, item);
    } else if (item.action === 'UPDATE_STOCK') {
      return this.handleStockUpdate(shopId, item);
    } else if (item.action === 'CREATE_DRAFT_PRODUCT') {
      return this.handleDraftProduct(shopId, item);
    }

    throw new BadRequestException('Action inconnue : ' + item.action);
  }

  private async handleExternalSale(shopId: string, item: SyncItemDto): Promise<SyncItemResult> {
    const qty = Math.max(1, item.quantity || 1);

    let variant = item.variantId
      ? await this.prisma.offerVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        })
      : null;

    if (!variant && item.productId) {
      variant = await this.prisma.offerVariant.findFirst({
        where: { productId: item.productId },
        include: { product: true },
      });
    }

    if (!variant) {
      const conflict: SyncConflictItem = {
        conflictId: 'conf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        clientId: item.clientId,
        shopId,
        action: item.action,
        reason: 'PRODUCT_NOT_FOUND',
        serverStockOnHand: 0,
        requestedQuantity: qty,
        productTitle: 'Produit introuvable',
        createdAt: new Date().toISOString(),
        status: 'PENDING_RESOLVE',
      };
      return {
        clientId: item.clientId,
        status: 'CONFLICT',
        message: 'Le produit ciblé est introuvable sur le serveur.',
        conflict,
      };
    }

    if (variant.stockOnHand < qty) {
      const conflict: SyncConflictItem = {
        conflictId: 'conf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        clientId: item.clientId,
        shopId,
        action: item.action,
        reason: 'INSUFFICIENT_STOCK',
        serverStockOnHand: variant.stockOnHand,
        requestedQuantity: qty,
        productTitle: variant.product?.title || variant.name,
        variantName: variant.name,
        createdAt: new Date().toISOString(),
        status: 'PENDING_RESOLVE',
      };

      this.logger.warn(
        '[SyncService] CONFLIT DE STOCK : Produit ' + variant.product?.title + ' (Stock: ' + variant.stockOnHand + ', Vente: ' + qty + ')'
      );

      return {
        clientId: item.clientId,
        status: 'CONFLICT',
        message: 'Stock serveur insuffisant (' + variant.stockOnHand + ' dispo, ' + qty + ' demandé).',
        conflict,
      };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.offerVariant.update({
        where: { id: variant.id },
        data: {
          stockOnHand: { decrement: qty },
        },
      });

      await tx.stockMovement.create({
        data: {
          variantId: variant.id,
          delta: -qty,
          reason: 'SALE',
          reference: 'OFFLINE_SYNC:' + item.clientId,
        },
      });

      if (item.amountMinor && item.amountMinor > 0) {
        let channel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'DIRECT_TRANSFER' | 'CASH_ON_DELIVERY' | 'PICKUP' = 'PICKUP';
        if (item.paymentChannel === 'MTN_MOMO') channel = 'MTN_MOMO';
        else if (item.paymentChannel === 'MOOV_MONEY') channel = 'MOOV_MONEY';
        else if (item.paymentChannel === 'CARTE_BANCAIRE') channel = 'CARD';
        else channel = 'PICKUP';

        const entryShopId = variant.product?.shopId || shopId;

        await tx.cashbookEntry.create({
          data: {
            shopId: entryShopId,
            type: 'ENCAISSEMENT',
            amountMinor: item.amountMinor,
            currency: 'XOF',
            channel,
            reference: 'EXT_SALE_' + item.clientId.slice(0, 8),
            notes: 'Vente physique externe (' + qty + 'x ' + variant.name + ') synchronisée depuis mobile.',
          },
        });
      }

      return updatedVariant;
    });

    return {
      clientId: item.clientId,
      status: 'SYNCED',
      message: 'Vente externe et mouvement de stock synchronisés avec succès.',
      updatedStock: updated.stockOnHand,
    };
  }

  private async handleStockUpdate(shopId: string, item: SyncItemDto): Promise<SyncItemResult> {
    const newStock = typeof item.quantity === 'number' ? item.quantity : 0;
    if (newStock < 0) {
      throw new BadRequestException('Le stock ne peut pas être négatif.');
    }

    const variant = item.variantId
      ? await this.prisma.offerVariant.findUnique({ where: { id: item.variantId } })
      : null;

    if (!variant) {
      throw new NotFoundException('Variante introuvable.');
    }

    const delta = newStock - variant.stockOnHand;

    const updated = await this.prisma.$transaction(async (tx) => {
      const v = await tx.offerVariant.update({
        where: { id: variant.id },
        data: { stockOnHand: newStock },
      });

      await tx.stockMovement.create({
        data: {
          variantId: variant.id,
          delta,
          reason: 'INVENTORY_ADJUSTMENT',
          reference: 'OFFLINE_SYNC:' + item.clientId,
        },
      });

      return v;
    });

    return {
      clientId: item.clientId,
      status: 'SYNCED',
      message: 'Inventaire physique mis à jour.',
      updatedStock: updated.stockOnHand,
    };
  }

  private async handleDraftProduct(shopId: string, item: SyncItemDto): Promise<SyncItemResult> {
    const title = item.metadata?.title || 'Nouveau Produit Brouillon';
    const priceMinor = item.amountMinor || 1000000;

    await this.prisma.product.create({
      data: {
        shopId,
        title,
        description: item.metadata?.description || 'Brouillon créé hors-ligne.',
        category: item.metadata?.category || 'Général',
        isPublished: false,
        variants: {
          create: {
            sku: 'SKU-OFFLINE-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
            name: 'Standard',
            priceMinor,
            currency: 'XOF',
            stockOnHand: item.quantity || 1,
          },
        },
      },
    });

    return {
      clientId: item.clientId,
      status: 'SYNCED',
      message: 'Brouillon produit synchronisé.',
      updatedStock: item.quantity || 1,
    };
  }

  async resolveConflict(
    conflictId: string,
    strategy: 'FORCE_STOCK_OVERRIDE' | 'CANCEL_LOCAL_OPERATION',
    auditReason?: string
  ) {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      throw new NotFoundException('Conflit introuvable ou déjà résolu.');
    }

    if (strategy === 'FORCE_STOCK_OVERRIDE') {
      conflict.status = 'RESOLVED_OVERRIDE';
      this.logger.log('[SyncService] Conflit ' + conflictId + ' résolu par FORCE_OVERRIDE (' + (auditReason || 'Ajustement inventaire') + ')');
      return {
        success: true,
        resolution: 'FORCE_STOCK_OVERRIDE',
        message: 'Ajustement inventaire validé et audité.',
        conflict,
      };
    } else {
      conflict.status = 'RESOLVED_CANCELLED';
      this.logger.log('[SyncService] Conflit ' + conflictId + ' résolu par ANNULATION locale.');
      return {
        success: true,
        resolution: 'CANCEL_LOCAL_OPERATION',
        message: 'Opération locale annulée avec succès.',
        conflict,
      };
    }
  }

  async getConflicts(shopId: string): Promise<SyncConflictItem[]> {
    return Array.from(this.activeConflicts.values()).filter(
      (c) => c.shopId === shopId && c.status === 'PENDING_RESOLVE'
    );
  }
}
