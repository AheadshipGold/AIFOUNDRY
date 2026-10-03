import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { id: 'prd-adjaho-collier' },
    data: {
      title: 'Collier Plastron Haute Joaillerie',
      description: 'Création joaillière en bronze noble.',
    },
  });

  // Also update any purchase request titles containing ceremonies
  await prisma.purchaseRequest.updateMany({
    where: { title: { contains: 'cérémonie' } },
    data: {
      title: 'Parure de haute joaillerie en bronze ciselé',
    },
  });

  console.log('Database products & requests updated successfully.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
