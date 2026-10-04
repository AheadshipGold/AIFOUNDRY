const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const config = await prisma.platformConfig.findUnique({
    where: { id: 'cms_main' }
  });
  
  if (config) {
    const data = config.data;
    data.intemporelIcons = [
      {
        title: "Icônes Intemporelles",
        description: "Des pièces d'exception, hier, aujourd'hui et demain.",
        image: "/products/watch-chrono.jpg"
      },
      {
        title: "Art de Vivre",
        description: "L'élégance sublimée au quotidien.",
        image: "/products/leather-tote.jpg"
      }
    ];
    
    await prisma.platformConfig.update({
      where: { id: 'cms_main' },
      data: { data }
    });
    console.log('intemporelIcons added back to CMS!');
  }
}

run().then(() => process.exit(0));
