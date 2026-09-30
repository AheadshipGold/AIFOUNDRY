import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';

export interface OrderItemLine {
  variantId: string;
  itemTitle: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  totalAmountMinor: number;
  currency: string;
  paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY';
  paymentStatus: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED';
  fulfillmentStatus: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
  paymentInstructions?: {
    merchantAccount: string;
    merchantName: string;
    ussdCode?: string;
    reference: string;
  };
  lines: OrderItemLine[];
  createdAt: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly catalogService: CatalogService) {}

  private orders: OrderRecord[] = [
    {
      id: 'ord-01',
      orderNumber: 'OJK-2026-0891',
      buyerName: 'Koffi Mensah',
      buyerPhone: '+229 97 45 88 12',
      deliveryAddress: 'Haie Vive, Villa 45, Cotonou',
      totalAmountMinor: 18500000,
      currency: 'XOF',
      paymentChannel: 'MTN_MOMO',
      paymentStatus: 'SETTLED_TO_MERCHANT',
      fulfillmentStatus: 'SHIPPED',
      paymentInstructions: {
        merchantAccount: '+229 97 12 34 56',
        merchantName: 'Maison Ganvié & Fils',
        ussdCode: '*400*1*1*97123456*185000#',
        reference: 'OJK-2026-0891',
      },
      lines: [
        {
          variantId: 'var-01-ebene',
          itemTitle: 'Sac Cabas Grand Marché — Cuir Ébène',
          sku: 'GAN-CAB-EBN-01',
          quantity: 1,
          unitPriceMinor: 18500000,
          totalMinor: 18500000,
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    }
  ];

  findAll(): OrderRecord[] {
    return this.orders;
  }

  findById(id: string): OrderRecord {
    const o = this.orders.find(item => item.id === id || item.orderNumber === id);
    if (!o) throw new NotFoundException(`Order ${id} not found`);
    return o;
  }

  createOrder(dto: {
    buyerName: string;
    buyerPhone: string;
    deliveryAddress: string;
    paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY';
    items: Array<{ variantId: string; quantity: number }>;
  }): OrderRecord {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const lines: OrderItemLine[] = [];
    let grandTotalMinor = 0;

    for (const item of dto.items) {
      // Find variant in catalog
      const allProducts = this.catalogService.findAll();
      let matchedVariant: any = null;
      let matchedProd: any = null;

      for (const p of allProducts) {
        const v = p.variants.find(vItem => vItem.id === item.variantId);
        if (v) {
          matchedVariant = v;
          matchedProd = p;
          break;
        }
      }

      if (!matchedVariant) {
        throw new NotFoundException(`Variant ${item.variantId} not found`);
      }

      // Atomic reservation check
      const success = this.catalogService.reserveVariantStock(item.variantId, item.quantity);
      if (!success) {
        throw new BadRequestException(
          `Stock insuffisant pour ${matchedProd.title} (${matchedVariant.name}). Réservation impossible.`
        );
      }

      const lineTotal = matchedVariant.priceMinor * item.quantity;
      grandTotalMinor += lineTotal;

      lines.push({
        variantId: matchedVariant.id,
        itemTitle: `${matchedProd.title} — ${matchedVariant.name}`,
        sku: matchedVariant.sku,
        quantity: item.quantity,
        unitPriceMinor: matchedVariant.priceMinor,
        totalMinor: lineTotal,
      });
    }

    const orderNum = `OJK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: orderNum,
      buyerName: dto.buyerName,
      buyerPhone: dto.buyerPhone,
      deliveryAddress: dto.deliveryAddress,
      totalAmountMinor: grandTotalMinor,
      currency: 'XOF',
      paymentChannel: dto.paymentChannel,
      paymentStatus: dto.paymentChannel === 'CARD' ? 'SETTLED_TO_MERCHANT' : 'PENDING',
      fulfillmentStatus: 'PREPARING',
      paymentInstructions: {
        merchantAccount: '+229 97 12 34 56',
        merchantName: 'Maison Ganvié & Fils',
        ussdCode: dto.paymentChannel === 'MTN_MOMO' ? `*400*1*1*97123456*${Math.round(grandTotalMinor / 100)}#` : undefined,
        reference: orderNum,
      },
      lines,
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateStatus(
    id: string,
    updates: {
      paymentStatus?: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED';
      fulfillmentStatus?: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
    },
  ): OrderRecord {
    const o = this.findById(id);
    if (updates.paymentStatus) o.paymentStatus = updates.paymentStatus;
    if (updates.fulfillmentStatus) o.fulfillmentStatus = updates.fulfillmentStatus;
    return o;
  }
}
