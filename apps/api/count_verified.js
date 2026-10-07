const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.count({
  where: { shop: { isVerified: true, kycStatus: 'VERIFIED' } }
}).then(c => console.log('Products from verified shops:', c)).finally(() => prisma.$disconnect());
