const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shops = await prisma.shop.findMany({ select: { name: true, isVerified: true, kycStatus: true }});
  console.log(shops);
}
main().finally(() => prisma.$disconnect());
