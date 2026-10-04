const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = {
  featuredProducts: [
    {
      id: "prod-1",
      title: "Chronomètre Heritage",
      subtitle: "Édition Limitée",
      category: "watches",
      price: 1250000,
      currency: "XOF",
      rating: 4.9,
      reviewsCount: 12,
      image: "/products/watch-chrono.jpg",
      seller: {
        name: "Atelier Genève",
        city: "Cotonou",
        isPremium: true
      }
    },
    {
      id: "prod-2",
      title: "Sac Cabas Essentiel",
      subtitle: "Cuir pleine fleur",
      category: "leather",
      price: 185000,
      currency: "XOF",
      rating: 4.8,
      reviewsCount: 34,
      image: "/products/leather-tote.jpg",
      seller: {
        name: "Maison Abomey",
        city: "Abomey",
        isPremium: true
      }
    },
    {
      id: "prod-3",
      title: "Fauteuil Colonial Re-imaginé",
      subtitle: "Teck et lin",
      category: "home",
      price: 450000,
      currency: "XOF",
      rating: 5.0,
      reviewsCount: 8,
      image: "/products/armchair.jpg",
      seller: {
        name: "Ébénisterie Royale",
        city: "Ouidah",
        isPremium: false
      }
    },
    {
      id: "prod-4",
      title: "Parure Or & Émeraude",
      subtitle: "Design contemporain",
      category: "fashion",
      price: 850000,
      currency: "XOF",
      rating: 4.7,
      reviewsCount: 15,
      image: "/products/jewelry-gold.jpg",
      seller: {
        name: "Bijoux d'Afrique",
        city: "Dakar",
        isPremium: true
      }
    }
  ],
  trustedShops: [
    {
      name: "Atelier Genève",
      initials: "AG",
      verified: true,
      rating: 4.9,
      reviews: 124
    },
    {
      name: "Maison Abomey",
      initials: "MA",
      verified: true,
      rating: 4.8,
      reviews: 340
    },
    {
      name: "Ouidah Arts",
      initials: "OA",
      verified: true,
      rating: 4.7,
      reviews: 89
    }
  ],
  banners: []
};

async function run() {
  await prisma.platformConfig.upsert({
    where: { id: 'cms_main' },
    update: { data: data },
    create: { id: 'cms_main', data: data }
  });
  console.log('CMS Seeded!');
}

run().then(() => process.exit(0));
