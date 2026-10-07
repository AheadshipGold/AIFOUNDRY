const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.product.updateMany({
    where: { category: 'art' },
    data: { images: ['/products/art-bronze.jpg'] }
  });
  await prisma.product.updateMany({
    where: { category: 'home' },
    data: { images: ['/products/armchair.jpg'] }
  });
  await prisma.product.updateMany({
    where: { category: 'watches' },
    data: { images: ['/products/watch-chrono.jpg'] }
  });
  await prisma.product.updateMany({
    where: { category: 'leather' },
    data: { images: ['/products/leather-tote.jpg'] }
  });
  
  // For anything else that lacks images
  const all = await prisma.product.findMany();
  for (const p of all) {
    if (!p.images || p.images.length === 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: { images: ['/products/digital-patterns.jpg'] }
      });
    }
  }
  
  console.log("Updated images arrays for all products in DB");
}
main().finally(() => prisma.$disconnect());
