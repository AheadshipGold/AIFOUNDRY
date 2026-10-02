import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, FulfillmentStatus, PaymentChannel } from '@prisma/client';

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
  paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY' | string;
  paymentStatus: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED' | string;
  fulfillmentStatus: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | string;
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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<OrderRecord[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        lines: {
          include: { variant: true }
        },
        buyer: true,
        shop: {
          include: { paymentConnections: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(o => this.mapToRecord(o));
  }

  async findById(id: string): Promise<OrderRecord> {
    const o = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id }
        ]
      },
      include: {
        lines: {
          include: { variant: true }
        },
        buyer: true,
        shop: {
          include: { paymentConnections: true }
        }
      }
    });

    if (!o) throw new NotFoundException(`Order ${id} not found`);
    return this.mapToRecord(o);
  }

  async createOrder(dto: {
    buyerName: string;
    buyerPhone: string;
    deliveryAddress: string;
    paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY';
    items: Array<{ variantId: string; quantity: number }>;
  }): Promise<OrderRecord> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      let grandTotalMinor = 0;
      let shopId: string | null = null;
      const orderLinesData = [];

      for (const item of dto.items) {
        const variant = await tx.offerVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { include: { shop: true } } }
        });

        if (!variant) {
          throw new NotFoundException(`Variant ${item.variantId} not found`);
        }

        if ((variant.stockOnHand - variant.stockReserved) < item.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${variant.product.title} (${variant.name}). Réservation impossible.`
          );
        }

        if (!shopId) {
          shopId = variant.product.shopId;
        } else if (shopId !== variant.product.shopId) {
          throw new BadRequestException('All items must be from the same shop');
        }

        await tx.offerVariant.update({
          where: { id: variant.id },
          data: { stockReserved: { increment: item.quantity } }
        });

        const lineTotal = variant.priceMinor * item.quantity;
        grandTotalMinor += lineTotal;

        orderLinesData.push({
          variantId: variant.id,
          itemTitle: `${variant.product.title} — ${variant.name}`,
          quantity: item.quantity,
          unitPriceMinor: variant.priceMinor,
        });
      }

      if (!shopId) {
        throw new BadRequestException('Could not determine shop for the order');
      }

      let buyer = await tx.user.findFirst({ where: { phone: dto.buyerPhone } });
      if (!buyer) {
        buyer = await tx.user.findFirst({ where: { role: 'BUYER' } });
      }
      if (!buyer) {
        buyer = await tx.user.create({
          data: {
            name: dto.buyerName,
            email: `buyer_${Date.now()}@example.com`,
            phone: dto.buyerPhone,
            role: 'BUYER'
          }
        });
      }

      const orderNum = `OJK-2026-${Math.floor(1000 + Math.random() * 9000).toString()}`;
      
      const newOrder = await tx.order.create({
        data: {
          shopId,
          buyerId: buyer.id,
          orderNumber: orderNum,
          totalAmountMinor: grandTotalMinor,
          grossSaleAmountMinor: grandTotalMinor,
          amountOutstandingMinor: grandTotalMinor,
          amountReceivedMinor: 0,
          currency: 'XOF',
          paymentChannel: dto.paymentChannel as PaymentChannel,
          paymentStatus: dto.paymentChannel === 'CARD' ? PaymentStatus.CONFIRMED : PaymentStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.PREPARING,
          deliveryAddress: dto.deliveryAddress,
          lines: {
            create: orderLinesData
          }
        },
        include: {
          lines: { include: { variant: true } },
          buyer: true,
          shop: { include: { paymentConnections: true } }
        }
      });

      await tx.financialEvent.create({
        data: {
          shopId: shopId,
          orderId: newOrder.id,
          eventType: 'SALE_CREATED',
          amountMinor: grandTotalMinor,
          currency: 'XOF',
          source: 'UNKNOWN',
          channel: dto.paymentChannel as PaymentChannel,
          reference: orderNum,
        }
      });

      return this.mapToRecord(newOrder);
    });
  }

  async updateStatus(
    id: string,
    updates: {
      paymentStatus?: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED';
      fulfillmentStatus?: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
    },
  ): Promise<OrderRecord> {
    const o = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!o) throw new NotFoundException(`Order ${id} not found`);

    let newPaymentStatus = o.paymentStatus;
    if (updates.paymentStatus) {
      newPaymentStatus = updates.paymentStatus === 'SETTLED_TO_MERCHANT' ? PaymentStatus.CONFIRMED : (updates.paymentStatus as PaymentStatus);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paymentStatus: newPaymentStatus,
          fulfillmentStatus: updates.fulfillmentStatus ? (updates.fulfillmentStatus as FulfillmentStatus) : undefined,
        },
        include: {
          lines: { include: { variant: true } },
          buyer: true,
          shop: { include: { paymentConnections: true } }
        }
      });

      if (o.paymentStatus !== PaymentStatus.CONFIRMED && newPaymentStatus === PaymentStatus.CONFIRMED) {
        await tx.financialEvent.create({
          data: {
            shopId: updatedOrder.shopId,
            orderId: updatedOrder.id,
            eventType: 'PAYMENT_CONFIRMED',
            amountMinor: updatedOrder.totalAmountMinor,
            currency: updatedOrder.currency,
            source: 'UNKNOWN',
            channel: updatedOrder.paymentChannel,
            reference: updatedOrder.orderNumber,
          }
        });
      }

      return this.mapToRecord(updatedOrder);
    });
  }

  private mapToRecord(o: any): OrderRecord {
    let paymentInstructions = undefined;
    if (o.shop && o.shop.paymentConnections) {
      const conn = o.shop.paymentConnections.find((c: any) => c.channel === o.paymentChannel && c.isActive);
      if (conn) {
        paymentInstructions = {
          merchantAccount: conn.merchantNumber || conn.merchantPhone || '',
          merchantName: o.shop.name,
          ussdCode: o.paymentChannel === 'MTN_MOMO' ? `*400*1*1*${conn.merchantNumber || conn.merchantPhone}*${Math.round(o.totalAmountMinor / 100)}#` : undefined,
          reference: o.orderNumber,
        };
      } else {
        paymentInstructions = {
          merchantAccount: '+229 97 12 34 56',
          merchantName: o.shop ? o.shop.name : 'Unknown Shop',
          reference: o.orderNumber,
        };
      }
    }

    let mappedPaymentStatus = o.paymentStatus;
    if (o.paymentStatus === 'CONFIRMED') {
      mappedPaymentStatus = 'SETTLED_TO_MERCHANT';
    }

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      buyerName: o.buyer?.name || o.buyerName || 'Unknown',
      buyerPhone: o.buyer?.phone || o.buyerPhone || 'Unknown',
      deliveryAddress: o.deliveryAddress || 'Unknown',
      totalAmountMinor: o.totalAmountMinor,
      currency: o.currency || 'XOF',
      paymentChannel: o.paymentChannel,
      paymentStatus: mappedPaymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      paymentInstructions,
      lines: o.lines ? o.lines.map((l: any) => ({
        variantId: l.variantId,
        itemTitle: l.itemTitle,
        sku: l.variant?.sku || '',
        quantity: l.quantity,
        unitPriceMinor: l.unitPriceMinor,
        totalMinor: l.unitPriceMinor * l.quantity,
      })) : [],
      createdAt: o.createdAt.toISOString(),
    };
  }
}
