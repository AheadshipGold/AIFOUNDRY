const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.product.updateMany({
    where: { category: 'art' },
    data: { image: '/products/art-bronze.jpg' }
  });
  await prisma.product.updateMany({
    where: { category: 'home' },
    data: { image: '/products/armchair.jpg' }
  });
  await prisma.product.updateMany({
    where: { category: 'watches' },
    data: { image: '/products/watch-chrono.jpg' }
  });
  await prisma.product.updateMany({
    where: { category: 'leather' },
    data: { image: '/products/leather-tote.jpg' }
  });
  await prisma.product.updateMany({
    where: { image: null },
    data: { image: '/products/digital-patterns.jpg' }
  });
  console.log("Updated images for all products in DB");
}
main().finally(() => prisma.$disconnect());
