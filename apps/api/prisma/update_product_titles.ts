import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Scanning and Updating Products in Database ---');
  const products = await prisma.product.findMany({
    include: { shop: true },
  });

  for (const prod of products) {
    const titleLower = (prod.title || '').toLowerCase();
    const descLower = (prod.description || '').toLowerCase();

    if (
      titleLower.includes('guel') ||
      titleLower.includes('gél') ||
      titleLower.includes('masque') ||
      titleLower.includes('vaudou') ||
      titleLower.includes('fetich') ||
      descLower.includes('guel') ||
      descLower.includes('gél') ||
      descLower.includes('masque')
    ) {
      console.log(`Updating product "${prod.title}" (${prod.id}) to "Buste Royal en Bronze Ciselé"`);
      await prisma.product.update({
        where: { id: prod.id },
        data: {
          title: 'Buste Royal en Bronze Ciselé',
          description: "Œuvre sculpturale d'art en bronze noble et patine royale d'Abomey",
        },
      });
    }

    if (prod.shop) {
      const shopNameLower = prod.shop.name.toLowerCase();
      if (
        shopNameLower.includes('ouidah') ||
        shopNameLower.includes('sculpture')
      ) {
        console.log(`Updating shop "${prod.shop.name}" (${prod.shop.id}) to "Atelier d'Art & Fonderie Royale"`);
        await prisma.shop.update({
          where: { id: prod.shop.id },
          data: {
            name: "Atelier d'Art & Fonderie Royale",
            city: 'Abomey',
          },
        });
      }
    }
  }

  // Also update any purchase request titles containing ceremonies
  await prisma.purchaseRequest.updateMany({
    where: {
      OR: [
        { title: { contains: 'cérémonie', mode: 'insensitive' } },
        { title: { contains: 'masque', mode: 'insensitive' } },
        { title: { contains: 'guélédé', mode: 'insensitive' } },
      ],
    },
    data: {
      title: 'Parure royale en bronze ciselé',
    },
  });

  console.log('--- Cleaning Up Test Orders and Test Fixtures ---');
  const deletedLines = await prisma.orderLine.deleteMany({
    where: {
      OR: [
        { order: { orderNumber: { startsWith: 'OJK-PROOF' } } },
        { order: { orderNumber: { startsWith: 'OJK-D02' } } },
        { order: { buyer: { email: { contains: 'proof' } } } },
        { order: { shopId: { in: ['shp-proof-a', 'shp-proof-b'] } } },
      ],
    },
  });

  const deletedFinancialEvents = await prisma.financialEvent.deleteMany({
    where: {
      OR: [
        { shopId: { in: ['shp-proof-a', 'shp-proof-b'] } },
      ],
    },
  });

  const deletedOrders = await prisma.order.deleteMany({
    where: {
      OR: [
        { orderNumber: { startsWith: 'OJK-PROOF' } },
        { orderNumber: { startsWith: 'OJK-D02' } },
        { buyer: { email: { contains: 'proof' } } },
        { shopId: { in: ['shp-proof-a', 'shp-proof-b'] } },
      ],
    },
  });

  console.log(`Cleaned: ${deletedLines.count} lines, ${deletedFinancialEvents.count} financial events, ${deletedOrders.count} test orders.`);
  console.log('Database successfully updated and cleaned.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

