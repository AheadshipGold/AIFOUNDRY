import { prisma } from './prisma';

export interface OrderItemLine {
  variantId: string;
  productId?: string;
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
  paymentChannel: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentInstructions?: {
    merchantAccount: string;
    merchantName: string;
    ussdCode?: string;
    reference: string;
  };
  lines: OrderItemLine[];
  buyerId?: string;
  shopId?: string;
  createdAt: string;
}

function mapToRecord(o: any): OrderRecord {
  const lines: OrderItemLine[] = (o.lines || []).map((l: any) => ({
    variantId: l.variantId,
    productId: l.variant?.productId,
    itemTitle: l.itemTitle,
    sku: l.variant?.sku || 'SKU-GENERIC',
    quantity: l.quantity,
    unitPriceMinor: l.unitPriceMinor,
    totalMinor: l.totalMinor,
  }));

  const mtnConn = o.shop?.paymentConnections?.find((c: any) => c.channel === 'MTN_MOMO');
  const merchantAccount = mtnConn?.merchantPhone || '+229 97 00 00 00';
  const totalInUnits = o.grossSaleAmountMinor / 100;
  const ussdCode = `*400*1*1*${merchantAccount.replace(/[^0-9]/g, '')}*${totalInUnits}#`;

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    buyerName: o.buyer?.name || 'Client Direct',
    buyerPhone: o.buyer?.phone || '+229 00 00 00 00',
    deliveryAddress: o.deliveryAddress || 'Retrait en boutique',
    totalAmountMinor: o.grossSaleAmountMinor,
    currency: o.currency,
    paymentChannel: o.paymentChannel,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    paymentInstructions: {
      merchantAccount,
      merchantName: o.shop?.name || 'Boutique Partenaire',
      ussdCode,
      reference: o.orderNumber,
    },
    lines,
    buyerId: o.buyerId,
    shopId: o.shopId,
    createdAt: o.createdAt.toISOString(),
  };
}

export async function getOrders(shopId?: string, userId?: string): Promise<OrderRecord[]> {
  const whereClause: any = {};
  if (shopId) {
    whereClause.shopId = shopId;
  } else if (userId) {
    whereClause.buyerId = userId;
  } else {
    return [];
  }

  const orders = await prisma.order.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    include: {
      lines: { include: { variant: true } },
      buyer: true,
      shop: { include: { paymentConnections: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((o) => mapToRecord(o));
}

export async function getOrderById(id: string): Promise<OrderRecord> {
  const o = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: {
      lines: { include: { variant: true } },
      buyer: true,
      shop: { include: { paymentConnections: true } },
    },
  });

  if (!o) throw new Error(`Commande ${id} introuvable`);
  return mapToRecord(o);
}

export async function createOrder(dto: {
  buyerId?: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  paymentChannel: string;
  items: Array<{ variantId: string; quantity: number }>;
}): Promise<OrderRecord> {
  if (!dto.items || dto.items.length === 0) {
    throw new Error('La commande doit contenir au moins un article');
  }

  return prisma.$transaction(async (tx) => {
    let grandTotalMinor = 0;
    let shopId: string | null = null;
    const orderLinesData = [];

    for (const item of dto.items) {
      const variant = await tx.offerVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { include: { shop: true } } },
      });

      if (!variant) {
        throw new Error(`Variante ${item.variantId} introuvable`);
      }

      if ((variant.stockOnHand - variant.stockReserved) < item.quantity) {
        throw new Error(
          `Stock insuffisant pour ${variant.product.title} (${variant.name}). Réservation impossible.`
        );
      }

      if (!shopId) {
        shopId = variant.product.shopId;
      } else if (shopId !== variant.product.shopId) {
        throw new Error('Tous les articles doivent provenir de la même boutique');
      }

      await tx.offerVariant.update({
        where: { id: variant.id },
        data: { stockReserved: { increment: item.quantity } },
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
      throw new Error('Impossible de déterminer la boutique associée');
    }

    let buyer = dto.buyerId ? await tx.user.findUnique({ where: { id: dto.buyerId } }) : null;
    if (!buyer) {
      const randomPhoneSuffix = dto.buyerPhone.replace(/[^0-9]/g, '').slice(-4) || '9999';
      const cleanName = dto.buyerName.trim() || 'Client Direct';
      const generatedEmail = `buyer_${randomPhoneSuffix}_${Date.now()}@ojarket.bj`;
      buyer = await tx.user.create({
        data: {
          email: generatedEmail,
          name: cleanName,
          phone: dto.buyerPhone,
          role: 'BUYER',
          locale: 'fr',
        },
      });
    }

    const orderNumber = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await tx.order.create({
      data: {
        orderNumber,
        buyerId: buyer.id,
        shopId,
        totalAmountMinor: grandTotalMinor,
        grossSaleAmountMinor: grandTotalMinor,
        currency: 'XOF',
        paymentChannel: (['MTN_MOMO', 'MOOV_MONEY', 'CELTIIS_CASH', 'CARD', 'DIRECT_TRANSFER', 'CASH_ON_DELIVERY', 'PICKUP'].includes(dto.paymentChannel) ? dto.paymentChannel : 'MTN_MOMO') as any,
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'PENDING',
        deliveryAddress: dto.deliveryAddress,
        lines: {
          create: orderLinesData.map((l) => ({
            variantId: l.variantId,
            itemTitle: l.itemTitle,
            quantity: l.quantity,
            unitPriceMinor: l.unitPriceMinor,
            
          })),
        },
      },
      include: {
        lines: { include: { variant: true } },
        buyer: true,
        shop: { include: { paymentConnections: true } },
      },
    });

    return mapToRecord(order);
  });
}
