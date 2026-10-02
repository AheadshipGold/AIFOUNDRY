import { PrismaClient, UserRole, ShopRole, RequestStatus, ProposalStatus, PaymentStatus, VerificationSource, FulfillmentStatus, PaymentChannel, EntryType, FinancialEventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up existing data to be idempotent
  await prisma.dayClosure.deleteMany();
  await prisma.cashbookEntry.deleteMany();
  await prisma.financialEvent.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.sellerProposal.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.offerVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shopPaymentConnection.deleteMany();
  await prisma.shopMembership.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  const amina = await prisma.user.create({
    data: { id: 'usr-buyer-amina', email: 'amina@ojarket.test', phone: '+22990000001', name: 'Amina Diop', role: 'BUYER', locale: 'fr' }
  });
  const koffi = await prisma.user.create({
    data: { id: 'usr-buyer-koffi', email: 'koffi@ojarket.test', phone: '+22990000002', name: 'Koffi Mensah', role: 'BUYER', locale: 'fr' }
  });
  const ganvie = await prisma.user.create({
    data: { id: 'usr-seller-ganvie', email: 'ganvie@ojarket.test', phone: '+22990000003', name: 'Maître Ganvié', role: 'SELLER', locale: 'fr' }
  });
  const adjaho = await prisma.user.create({
    data: { id: 'usr-seller-adjaho', email: 'adjaho@ojarket.test', phone: '+22990000004', name: 'Maître Adjaho', role: 'SELLER', locale: 'fr' }
  });

  // 2. Shops with ShopMemberships + ShopPaymentConnections
  const shopGanvie1 = await prisma.shop.create({
    data: {
      id: 'shp-ganvie-1', slug: 'maison-ganvie-fils', name: 'Maison Ganvié & Fils', craftType: 'maroquinerie', city: 'Cotonou', ownerId: ganvie.id, isVerified: true, kycStatus: 'VERIFIED',
      memberships: { create: [{ userId: ganvie.id, role: 'OWNER' }] },
      paymentConnections: { create: [{ channel: 'MTN_MOMO', merchantPhone: '+22990000003' }, { channel: 'MOOV_MONEY', merchantPhone: '+22990000003' }] }
    }
  });
  
  const shopAdjaho1 = await prisma.shop.create({
    data: {
      id: 'shp-adjaho-1', slug: 'fonderie-royale-abomey', name: "Fonderie Royale d'Abomey", craftType: 'joaillerie', city: 'Abomey', ownerId: adjaho.id, isVerified: true, kycStatus: 'VERIFIED',
      memberships: { create: [{ userId: adjaho.id, role: 'OWNER' }] },
      paymentConnections: { create: [{ channel: 'MTN_MOMO', merchantPhone: '+22990000004' }, { channel: 'CASH_ON_DELIVERY' }] }
    }
  });

  const shopGanvie2 = await prisma.shop.create({
    data: {
      id: 'shp-ganvie-2', slug: 'ebenisterie-de-la-lagune', name: 'Ébénisterie de la Lagune', craftType: 'mobilier', city: 'Porto-Novo', ownerId: ganvie.id, isVerified: true, kycStatus: 'VERIFIED',
      memberships: { create: [{ userId: ganvie.id, role: 'OWNER' }] },
      paymentConnections: { create: [{ channel: 'MTN_MOMO', merchantPhone: '+22990000003' }] }
    }
  });

  const shopAdjaho2 = await prisma.shop.create({
    data: {
      id: 'shp-adjaho-2', slug: 'tissages-precieux-bohicon', name: 'Tissages Précieux de Bohicon', craftType: 'mode', city: 'Bohicon', ownerId: adjaho.id, isVerified: true, kycStatus: 'VERIFIED',
      memberships: { create: [{ userId: adjaho.id, role: 'OWNER' }] },
      paymentConnections: { create: [{ channel: 'MOOV_MONEY', merchantPhone: '+22990000004' }] }
    }
  });

  // 3. Products
  const prod1 = await prisma.product.create({
    data: {
      id: 'prd-ganvie-sac', shopId: shopGanvie1.id, title: 'Sac Cabas Grand Marché', description: 'Sac en cuir.', category: 'maroquinerie', originCity: 'Cotonou',
      variants: { create: [{ id: 'var-ganvie-sac-1', sku: 'SAC-CAB-01', name: 'Standard', priceMinor: 18500000, stockOnHand: 4 }] }
    }
  });

  const prod2 = await prisma.product.create({
    data: {
      id: 'prd-adjaho-collier', shopId: shopAdjaho1.id, title: 'Collier Pectoral Reine Danxomé', description: 'Bronze ciselé.', category: 'joaillerie', originCity: 'Abomey',
      variants: { create: [{ id: 'var-adjaho-col-1', sku: 'COL-DAN-01', name: 'Standard', priceMinor: 32000000, stockOnHand: 2 }] }
    }
  });

  const prod3 = await prisma.product.create({
    data: {
      id: 'prd-ganvie-console', shopId: shopGanvie2.id, title: 'Console Assoba Iroko & Marbre Noir', description: 'Bois iroko.', category: 'mobilier', originCity: 'Porto-Novo',
      variants: { create: [{ id: 'var-ganvie-con-1', sku: 'CON-IRO-01', name: 'Standard', priceMinor: 65000000, stockOnHand: 1 }] }
    }
  });

  const prod4 = await prisma.product.create({
    data: {
      id: 'prd-adjaho-cape', shopId: shopAdjaho2.id, title: 'Cape Tissée Kanvo Impérial', description: 'Coton tissé.', category: 'mode', originCity: 'Bohicon',
      variants: { create: [{ id: 'var-adjaho-cap-1', sku: 'CAP-KAN-01', name: 'Standard', priceMinor: 24000000, stockOnHand: 3 }] }
    }
  });

  // 4. 1 PurchaseRequest
  const req1 = await prisma.purchaseRequest.create({
    data: {
      id: 'req-amina-1', buyerId: amina.id, title: 'Parure royale en bronze ciselé', description: 'Besoin de parure.', category: 'joaillerie', status: 'MATCHED',
      proposals: {
        create: [{
          id: 'prop-adjaho-1', shopId: shopAdjaho1.id, priceMinor: 35000000, proposalNotes: 'Disponible sur commande.', status: 'PENDING'
        }]
      }
    }
  });

  // 5. 1 Order
  const order1 = await prisma.order.create({
    data: {
      id: 'ord-koffi-1', shopId: shopGanvie1.id, buyerId: koffi.id, orderNumber: 'OJK-2026-0891', totalAmountMinor: 18500000, grossSaleAmountMinor: 18500000, paymentStatus: 'CONFIRMED', fulfillmentStatus: 'SHIPPED', paymentChannel: 'MTN_MOMO',
      lines: {
        create: [{
          id: 'line-koffi-1', variantId: 'var-ganvie-sac-1', itemTitle: 'Sac Cabas Grand Marché', quantity: 1, unitPriceMinor: 18500000
        }]
      },
      financialEvents: {
        create: [{
          id: 'fe-koffi-1', shopId: shopGanvie1.id, eventType: 'PAYMENT_CONFIRMED', amountMinor: 18500000
        }]
      }
    }
  });

  // 6. 3 CashbookEntries
  await prisma.cashbookEntry.createMany({
    data: [
      { id: 'cb-ganvie-1', shopId: shopGanvie1.id, type: 'ENCAISSEMENT', amountMinor: 18500000, channel: 'MTN_MOMO', reference: 'MOMO-123' },
      { id: 'cb-ganvie-2', shopId: shopGanvie1.id, type: 'ENCAISSEMENT', amountMinor: 4500000, channel: 'CASH_ON_DELIVERY', reference: 'CASH-456' },
      { id: 'cb-ganvie-3', shopId: shopGanvie1.id, type: 'DECAISSEMENT', amountMinor: -8000000, channel: 'CASH_ON_DELIVERY', reference: 'SUPPLIER-789' }
    ]
  });

  // 7. 1 DayClosure
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await prisma.dayClosure.create({
    data: {
      id: 'dc-ganvie-1', shopId: shopGanvie1.id, closureDate: yesterday, totalVenduMinor: 18500000, totalEncaisseMinor: 23000000, totalRestantMinor: -4500000, closedBy: ganvie.id, status: 'BALANCED'
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
