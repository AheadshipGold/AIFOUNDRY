import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || '').trim();

    if (!prompt) {
      return NextResponse.json(
        { message: 'Veuillez décrire succinctement votre idée ou le produit recherché.' },
        { status: 400 }
      );
    }

    const lower = prompt.toLowerCase();

    // 1. Détection sémantique de la catégorie
    let category = 'leather';
    let defaultPrice = 85000;
    let defaultDays = 10;
    let materials: string[] = ['Cuir pleine fleur', 'Finitions laiton patiné'];

    if (lower.includes('montre') || lower.includes('horlog') || lower.includes('chrono') || lower.includes('cadran')) {
      category = 'watches';
      defaultPrice = 185000;
      defaultDays = 14;
      materials = ['Acier inoxydable 316L', 'Verre saphir inrayable', 'Bracelet cuir surpiqué'];
    } else if (lower.includes('bague') || lower.includes('collier') || lower.includes('bracelet') || lower.includes('bijou') || lower.includes('or ') || lower.includes('argent') || lower.includes('bronze')) {
      category = 'jewelry';
      defaultPrice = 120000;
      defaultDays = 12;
      materials = ['Bronze coulé d’art', 'Dorure satinée 18 carats', 'Ciselure artisanale à la main'];
    } else if (lower.includes('robe') || lower.includes('costume') || lower.includes('chemise') || lower.includes('tissu') || lower.includes('soie') || lower.includes('pagne') || lower.includes('coton')) {
      category = 'fashion';
      defaultPrice = 65000;
      defaultDays = 7;
      materials = ['Coton biologique filé main', 'Soie naturelle', 'Teinture végétale d’atelier'];
    } else if (lower.includes('table') || lower.includes('fauteuil') || lower.includes('meuble') || lower.includes('bois') || lower.includes('sculpture') || lower.includes('chaise')) {
      category = 'home';
      defaultPrice = 220000;
      defaultDays = 18;
      materials = ['Bois noble de teck massif', 'Assemblage tenon-mortaise', 'Vernis mat écologique'];
    } else if (lower.includes('sac') || lower.includes('cuir') || lower.includes('pochette') || lower.includes('ceinture') || lower.includes('portefeuille')) {
      category = 'leather';
      defaultPrice = 95000;
      defaultDays = 9;
      materials = ['Cuir tanné végétal', 'Bouclerie en laiton massif', 'Fil de lin ciré'];
    }

    // 2. Recherche de boutiques d'excellence partenaires dans la base
    const matchingShops = await prisma.shop.findMany({
      where: {
        isVerified: true,
      },
      select: { name: true, city: true },
      take: 3,
    });

    const targetBoutiques = matchingShops.length > 0
      ? matchingShops.map((s) => `${s.name} (${s.city})`)
      : ['Kingston Bio (Cotonou)', 'Atelier Maître Artisan (Cotonou)'];

    // 3. Titre raffiné haute couture
    const words = prompt.split(/\s+/).slice(0, 7).join(' ');
    const refinedTitle = words.charAt(0).toUpperCase() + words.slice(1);

    const deliveryEstimate = `${defaultDays} à ${defaultDays + 4} jours ouvrés`;
    const technicalSummary = `Spécifications validées : sélection de matériaux nobles (${materials.join(', ')}), façonnage artisanal en atelier certifié, contrôle d’authenticité et livraison sécurisée à Cotonou / sous-région.`;

    return NextResponse.json({
      refinedTitle,
      category,
      materials,
      estimatedDays: defaultDays,
      priceEstimateFCFA: defaultPrice,
      deliveryEstimate,
      targetBoutiques,
      technicalSummary,
    });
  } catch (err: any) {
    console.error('[AI Analyze Error]', err);
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la structuration de la demande' },
      { status: 500 }
    );
  }
}
