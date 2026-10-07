const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.product.updateMany({
    where: { title: { contains: 'Buste' } },
    data: { images: ['/products/art-bronze.jpg'] }
  });
  console.log("Updated Buste image in DB");
}
main().finally(() => prisma.$disconnect());
