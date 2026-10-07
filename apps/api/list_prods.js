const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    include: { shop: { include: { owner: true } } }
  });
  console.log("=== DB PRODUCTS ===");
  products.forEach(p => {
    console.log(`- ${p.title} | Shop: ${p.shop.name} | Verified: ${p.shop.isVerified} | Owner: ${p.shop.owner.name} (${p.shop.owner.email})`);
  });
}
main().finally(() => prisma.$disconnect());
