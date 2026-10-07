const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.count().then(c => console.log('Total products:', c)).finally(() => prisma.$disconnect());
