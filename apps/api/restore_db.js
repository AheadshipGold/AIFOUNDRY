const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== SYNCHRONISATION DU CMS ET DES VRAIS PRODUITS DE LA BASE DE DONNÉES ===");

  // 1. Compte Administrateur (ABRAHAM B. A. / damacarre@gmail.com)
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    throw new Error("Admin user not found!");
  }

  // 2. Boutique Officielle de l'Administrateur
  let adminShop = await prisma.shop.findFirst({
    where: { ownerId: admin.id }
  });

  if (adminShop) {
    adminShop = await prisma.shop.update({
      where: { id: adminShop.id },
      data: {
        name: "Kingston Bio",
        slug: "kingston-bio",
        description: "Boutique Officielle Kingston Bio — Haute Facture & Créations d'Exception",
        craftType: "haute_facture",
        city: "Cotonou",
        country: "Bénin",
        isVerified: true,
        kycStatus: "VERIFIED",
        storefrontTheme: "dark",
      }
    });
  } else {
    adminShop = await prisma.shop.create({
      data: {
        ownerId: admin.id,
        name: "Kingston Bio",
        slug: "kingston-bio",
        description: "Boutique Officielle Kingston Bio — Haute Facture & Créations d'Exception",
        craftType: "haute_facture",
        city: "Cotonou",
        country: "Bénin",
        isVerified: true,
        kycStatus: "VERIFIED",
        storefrontTheme: "dark",
      }
    });
  }

  // 3. Validation des boutiques partenaires en base de données
  await prisma.shop.updateMany({
    where: {
      slug: { in: ['shp-ganvie-1', 'shp-adjaho-1', 'maison-ganvie-fils', 'fonderie-royale-abomey'] }
    },
    data: {
      isVerified: true,
      kycStatus: "VERIFIED"
    }
  });

  // 4. Définition des 5 produits phares réels dans la boutique de l'administrateur
  const productsToCreate = [
    {
      title: "Chronomètre Heritage",
      description: "Garde-temps d'exception de haute horlogerie, boîtier or noble et mouvement mécanique suisse de haute précision.",
      category: "watches",
      images: ["/products/watch-chrono.jpg"],
      priceMinor: 125000000,
      sku: "ABR-WATCH-001",
      rating: 4.9,
      reviewsCount: 14,
    },
    {
      title: "Sac Cabas Essentiel",
      description: "Maroquinerie de prestige en cuir pleine fleur tanné végétal, finitions couture sellier et bouclerie laiton massif.",
      category: "leather",
      images: ["/products/leather-tote.jpg"],
      priceMinor: 18500000,
      sku: "ABR-LEATHER-001",
      rating: 4.8,
      reviewsCount: 36,
    },
    {
      title: "Fauteuil Colonial",
      description: "Assise royale sculptée en bois d'Iroko noble, garniture velours vert impérial et patine cirée traditionnelle.",
      category: "home",
      images: ["/products/armchair.jpg"],
      priceMinor: 45000000,
      sku: "ABR-HOME-001",
      rating: 5.0,
      reviewsCount: 8,
    },
    {
      title: "Parure Or & Émeraude",
      description: "Création joaillière en or 18 carats ornée d'émeraudes naturelles taillées sur mesure par nos maîtres orfèvres.",
      category: "fashion",
      images: ["/products/jewelry-gold.jpg"],
      priceMinor: 85000000,
      sku: "ABR-JEWEL-001",
      rating: 4.7,
      reviewsCount: 23,
    },
    {
      title: "Buste Royal en Bronze Ciselé",
      description: "Chef-d'œuvre sculpté à la cire perdue et patine royale d'Abomey, pièce unique d'apparat.",
      category: "art",
      images: ["/products/art-bronze.jpg"],
      priceMinor: 32000000,
      sku: "ABR-ART-001",
      rating: 4.9,
      reviewsCount: 19,
    },
  ];

  const realProducts = [];

  for (const item of productsToCreate) {
    let existingProd = await prisma.product.findFirst({
      where: {
        shopId: adminShop.id,
        title: item.title,
      },
      include: { variants: true }
    });

    if (!existingProd) {
      existingProd = await prisma.product.create({
        data: {
          shopId: adminShop.id,
          title: item.title,
          description: item.description,
          category: item.category,
          originCity: "Cotonou",
          isPublished: true,
          images: item.images,
          variants: {
            create: {
              sku: item.sku,
              name: item.title,
              priceMinor: item.priceMinor,
              currency: "XOF",
              stockOnHand: 10,
              stockReserved: 0,
              isAvailable: true,
            }
          }
        },
        include: { variants: true }
      });
    }

    realProducts.push({
      id: existingProd.id,
      title: existingProd.title,
      description: existingProd.description,
      category: existingProd.category,
      price: Math.round(item.priceMinor / 100),
      currency: "FCFA",
      image: existingProd.images[0],
      rating: item.rating,
      reviewsCount: item.reviewsCount,
      seller: {
        id: adminShop.id,
        name: adminShop.name,
        city: adminShop.city,
        isPremium: true,
      }
    });
  }

  // 5. Boutiques de confiance réelles de la base de données
  const partnerShops = await prisma.shop.findMany({
    where: {
      isVerified: true,
      kycStatus: "VERIFIED"
    },
    include: {
      products: true
    }
  });

  const trustedShopsData = partnerShops.map(s => {
    const initials = s.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    const imgs = s.products.flatMap(p => p.images || []).slice(0, 2);
    if (imgs.length === 0) {
      imgs.push("/products/art-bronze.jpg", "/products/leather-tote.jpg");
    }
    return {
      id: s.id,
      name: s.name,
      initials: initials || "MA",
      verified: true,
      rating: 4.9,
      reviews: 142,
      city: s.city,
      products: imgs
    };
  });

  const cmsContent = {
    featuredProducts: realProducts,
    intemporelIcons: [
      {
        title: "Montres",
        subtitle: "Haute Horlogerie",
        description: "Des garde-temps d'exception, alliant précision mécanique et élégance intemporelle.",
        image: "/products/watch-chrono.jpg",
        categoryId: "watches"
      },
      {
        title: "Maroquinerie",
        subtitle: "Cuir Héritage",
        description: "L'art du cuir d'exception, façonné à la main avec une exigence sans compromis.",
        image: "/products/leather-tote.jpg",
        categoryId: "leather"
      },
      {
        title: "Haute Joaillerie",
        subtitle: "Or & Parures Précieuses",
        description: "L'éclat des créations joaillières nobles et des métaux précieux façonnés par nos maîtres.",
        image: "/products/jewelry-gold.jpg",
        categoryId: "fashion"
      }
    ],
    trustedShops: trustedShopsData,
  };

  await prisma.platformConfig.upsert({
    where: { id: 'cms_main' },
    update: { data: cmsContent },
    create: { id: 'cms_main', data: cmsContent },
  });

  console.log("CMS Data beautifully synced with real DB products & admin shop.");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
