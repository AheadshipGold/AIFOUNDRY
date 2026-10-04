const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUser() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'ABRAHAM' } }
  });
  console.log(users);
  
  if(users.length > 0) {
    await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'ADMIN' }
    });
    console.log(`Promoted ${users[0].email} to ADMIN!`);
  }
}
findUser().then(() => process.exit(0));
