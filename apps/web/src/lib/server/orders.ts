import { prisma } from './prisma';

export interface OrderItemLine {
  variantId: string;
  productId?: string;
  itemTitle: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
  image?: string;
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
    totalMinor: l.totalMinor ?? l.unitPriceMinor * l.quantity,
    image: l.variant?.product?.images?.[0] || undefined,
  }));

  const mtnConn = o.shop?.paymentConnections?.find((c: any) => c.channel === 'MTN_MOMO');
  const merchantAccount = mtnConn?.merchantPhone || '+229 97 00 00 00';
  const totalInUnits = o.grossSaleAmountMinor / 100;
  const ussdCode = `*400*1*1*${merchantAccount.replace(/[^0-9]/g, '')}*${totalInUnits}#`;

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    buyerName: o.buyer?.name || 'Client Direct',
    buyerPhone: o.buyer?.phone || o.buyer?.phoneNumber || '',
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
    where: whereClause,
    include: {
      lines: { include: { variant: { include: { product: true } } } },
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
      let variant = await tx.offerVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { include: { shop: true } } },
      });

      // Resilience fallback: If variantId was a synthetic placeholder or direct product reference
      if (!variant) {
        variant = await tx.offerVariant.findFirst({
          where: {
            OR: [
              { productId: item.variantId },
              { product: { id: item.variantId } },
            ],
          },
          include: { product: { include: { shop: true } } },
        });
      }

      // If still not found, check if a product exists and pick or create its default variant
      if (!variant) {
        const prod = await tx.product.findFirst({
          where: {
            OR: [
              { id: item.variantId },
              { id: (item as any).productId },
            ],
          },
          include: { shop: true, variants: true },
        });

        if (prod) {
          if (prod.variants && prod.variants.length > 0) {
            variant = {
              ...prod.variants[0],
              product: prod,
            } as any;
          } else {
            const newVar = await tx.offerVariant.create({
              data: {
                sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
                name: prod.title,
                priceMinor: (item as any).unitPriceMinor || 100000,
                currency: prod.shop?.currency || 'XOF',
                stockOnHand: 10,
                stockReserved: 0,
                isAvailable: true,
                productId: prod.id,
              },
            });
            variant = { ...newVar, product: prod } as any;
          }
        }
      }

      if (!variant) {
        throw new Error(`Article introuvable pour la commande.`);
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

    // Vérification Deny-by-Default A06 & Accord de la boutique
    const requestedChannel = (['MTN_MOMO', 'MOOV_MONEY', 'CELTIIS_CASH', 'CARD', 'DIRECT_TRANSFER', 'CASH_ON_DELIVERY', 'PICKUP'].includes(dto.paymentChannel) ? dto.paymentChannel : 'MTN_MOMO') as any;

    const platformCorridor = await tx.paymentCorridorRule.findFirst({
      where: { channel: requestedChannel },
    });
    if (platformCorridor && !platformCorridor.isEnabled) {
      throw new Error(`Le canal de paiement "${requestedChannel}" est suspendu par la plateforme.`);
    }

    const shopConn = await tx.shopPaymentConnection.findUnique({
      where: { shopId_channel: { shopId, channel: requestedChannel } },
    });
    if (shopConn && !shopConn.isActive) {
      throw new Error(`Cette boutique n'accepte pas les règlements par ${requestedChannel}.`);
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
        paymentChannel: requestedChannel,
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

export async function updateOrderStatus(
  orderId: string,
  updates: {
    paymentStatus?: string;
    fulfillmentStatus?: string;
  },
  shopId?: string,
  userId?: string
): Promise<OrderRecord> {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { lines: true, shop: true },
  });

  if (!order) {
    throw new Error(`Commande [${orderId}] introuvable`);
  }

  if (shopId && order.shopId !== shopId) {
    throw new Error('Action non autorisée pour cette boutique');
  }

  const data: any = {};
  let recordCollection = false;
  if (updates.paymentStatus) {
    // Legacy alias used by older clients
    const normalized = updates.paymentStatus === 'SETTLED_TO_MERCHANT' ? 'CONFIRMED' : updates.paymentStatus;
    data.paymentStatus = normalized;
    if (normalized === 'CONFIRMED') {
      data.amountReceivedMinor = order.totalAmountMinor;
      data.netCollectedMinor = order.totalAmountMinor;
      data.amountOutstandingMinor = 0;
      data.verificationSource = order.paymentChannel === 'CASH_ON_DELIVERY' ? 'COD' : 'SELLER_MANUAL';
      recordCollection = order.paymentStatus !== 'CONFIRMED';
    }
  }
  if (updates.fulfillmentStatus) {
    data.fulfillmentStatus = updates.fulfillmentStatus;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id: orderId },
      data,
      include: {
        lines: { include: { variant: { include: { product: true } } } },
        buyer: true,
        shop: { include: { paymentConnections: true } },
      },
    });

    // S44: every confirmed collection is mirrored in the shop cashbook (once)
    if (recordCollection) {
      await tx.cashbookEntry.create({
        data: {
          shopId: order.shopId,
          type: 'ENCAISSEMENT',
          amountMinor: order.totalAmountMinor,
          currency: order.currency,
          channel: order.paymentChannel,
          reference: order.orderNumber,
          notes: `Encaissement commande ${order.orderNumber}`,
          entryDate: new Date(),
        },
      });
    }

    return result;
  });

  return mapToRecord(updated);
}

export async function getSellerOrders(shopId: string): Promise<OrderRecord[]> {
  const orders = await prisma.order.findMany({
    where: { shopId },
    include: {
      lines: { include: { variant: { include: { product: true } } } },
      buyer: true,
      shop: { include: { paymentConnections: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map((o) => mapToRecord(o));
}

