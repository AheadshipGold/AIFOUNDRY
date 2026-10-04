import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function purge() {
  const result = await prisma.purchaseRequest.deleteMany({
    where: {
      buyer: {
        name: {
          in: ['Alexandre Houngbo', 'Jean', 'Marcelle', 'Didier Agossa']
        }
      }
    }
  });
  console.log('Purged fake requests:', result.count);
  
  await prisma.$disconnect();
}

purge().catch(console.error);
