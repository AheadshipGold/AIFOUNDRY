const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const config = await prisma.platformConfig.findUnique({
    where: { id: 'cms_main' }
  });
  console.log(config.data.intemporelIcons);
}

run().then(() => process.exit(0));
