import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  // Promote the specific user to PLATFORM_OWNER or ADMIN
  // For the moment, we use the role 'ADMIN' which is in our schema
  const email = 'alexandre@ojarket.test'; // or process.argv[2]
  
  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });
    console.log(`Successfully made ${user.email} an ADMIN`);
  } else {
    console.log('No user found to promote.');
  }
  
  await prisma.$disconnect();
}

seed().catch(console.error);
