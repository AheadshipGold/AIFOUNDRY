const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.count();
  const requests = await prisma.purchaseRequest.findMany({
    include: { buyer: true, proposals: { include: { shop: true } } },
  });
  const orders = await prisma.order.findMany({
    include: { shop: true, lines: true },
  });
  console.log('USERS COUNT:', users);
  console.log('PURCHASE REQUESTS COUNT:', requests.length);
  console.log('ORDERS COUNT:', orders.length);
  if (requests.length > 0) {
    console.log('REQUESTS:', JSON.stringify(requests.map(r => ({ id: r.id, title: r.title, buyer: r.buyer?.name, proposals: r.proposals.length })), null, 2));
  }
  if (orders.length > 0) {
    console.log('ORDERS:', JSON.stringify(orders.map(o => ({ id: o.id, num: o.orderNumber, buyer: o.buyerName, amount: o.totalAmountMinor })), null, 2));
  }
}
main().finally(() => prisma.$disconnect());
