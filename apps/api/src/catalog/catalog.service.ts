import { Injectable, NotFoundException } from '@nestjs/common';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceMinor: number;
  stockOnHand: number;
  stockReserved: number;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  artisanShop: {
    id: string;
    name: string;
    city: string;
    country: string;
    verified: boolean;
  };
  priceMinor: number;
  currency: string;
  stockOnHand: number;
  image: string;
  tags: string[];
  materials: string[];
  variants: ProductVariant[];
}

@Injectable()
export class CatalogService {
  private products: ProductItem[] = [
    {
      id: 'prod-01',
      title: 'Sac Cabas Grand Marché — Cuir Ébène & Laiton Massif',
      description: 'Pièce emblématique façonnée à la main par l\'Atelier Ganvié. Cuir pleine fleur tanné végétal avec surpiqûres sellier traditionnelles et ferrures en laiton poli.',
      category: 'maroquinerie',
      artisanShop: {
        id: 'shop-01',
        name: 'Maison Ganvié & Fils',
        city: 'Cotonou',
        country: 'Bénin',
        verified: true,
      },
      priceMinor: 18500000,
      currency: 'XOF',
      stockOnHand: 4,
      image: '/reference-assets/market-tote.png',
      tags: ['Cabas', 'Cuir Pleine Fleur', 'Série Limitée'],
      materials: ['Cuir pleine fleur', 'Laiton artisanal', 'Doublure coton indigo'],
      variants: [
        { id: 'var-01-ebene', sku: 'GAN-CAB-EBN-01', name: 'Cuir Ébène / Bouclerie Or Mat', priceMinor: 18500000, stockOnHand: 3, stockReserved: 0 },
        { id: 'var-01-cognac', sku: 'GAN-CAB-CGN-02', name: 'Cuir Cognac / Bouclerie Laiton Brossé', priceMinor: 19500000, stockOnHand: 1, stockReserved: 0 },
      ],
    },
    {
      id: 'prod-02',
      title: 'Collier Pectoral Reine Danxomé — Bronze à Cire Perdue',
      description: 'Inspiré des parures d\'apparat des souveraines royales. Chaque maillon est coulé selon le procédé ancestral de la cire perdue dans les ateliers d\'Abomey.',
      category: 'joaillerie',
      artisanShop: {
        id: 'shop-02',
        name: 'Fonderie Royale d\'Abomey',
        city: 'Abomey',
        country: 'Bénin',
        verified: true,
      },
      priceMinor: 32000000,
      currency: 'XOF',
      stockOnHand: 2,
      image: '/reference-assets/market-tote.png',
      tags: ['Joaillerie', 'Bronze Royal', 'Patrimoine'],
      materials: ['Bronze noble', 'Cire perdue', 'Finition satinée'],
      variants: [
        { id: 'var-02-medium', sku: 'ROY-COL-MED-01', name: 'Longueur 42cm / Finition Antique', priceMinor: 32000000, stockOnHand: 2, stockReserved: 0 },
      ],
    },
    {
      id: 'prod-03',
      title: 'Console Assoba — Bois d\'Iroko Centenaire & Marbre Noir',
      description: 'Table console architecturale taillée dans un bloc massif d\'iroko sélectionné avec plateau incrusté de marbre minéral.',
      category: 'mobilier',
      artisanShop: {
        id: 'shop-03',
        name: 'Ébénisterie de la Lagune',
        city: 'Porto-Novo',
        country: 'Bénin',
        verified: true,
      },
      priceMinor: 65000000,
      currency: 'XOF',
      stockOnHand: 1,
      image: '/reference-assets/market-tote.png',
      tags: ['Mobilier', 'Iroko Massif', 'Architecture'],
      materials: ['Iroko massif', 'Marbre noir', 'Cire naturelle d\'abeille'],
      variants: [
        { id: 'var-03-large', sku: 'EBE-ASSO-140', name: 'Longueur 140cm x Profondeur 40cm', priceMinor: 65000000, stockOnHand: 1, stockReserved: 0 },
      ],
    },
    {
      id: 'prod-04',
      title: 'Cape Tissée Kanvo Impérial — Soie d\'Araignée & Coton Bio',
      description: 'Étoffe royale tissée au métier traditionnel à double peigne par les maîtres tisserands de Bohicon.',
      category: 'mode',
      artisanShop: {
        id: 'shop-04',
        name: 'Tissages Précieux de Bohicon',
        city: 'Bohicon',
        country: 'Bénin',
        verified: true,
      },
      priceMinor: 24000000,
      currency: 'XOF',
      stockOnHand: 3,
      image: '/reference-assets/market-tote.png',
      tags: ['Kanvo', 'Tissage Royal', 'Couture'],
      materials: ['Coton biologique filé main', 'Fils dorés', 'Teinture indigo naturelle'],
      variants: [
        { id: 'var-04-unique', sku: 'TIS-KANV-IND-01', name: 'Taille Unique Réversible', priceMinor: 24000000, stockOnHand: 3, stockReserved: 0 },
      ],
    },
  ];

  findAll(query?: string, category?: string): ProductItem[] {
    return this.products.filter(item => {
      const matchesCat = category && category !== 'all' ? item.category === category : true;
      const matchesQuery = query
        ? item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.artisanShop.name.toLowerCase().includes(query.toLowerCase())
        : true;
      return matchesCat && matchesQuery;
    });
  }

  findById(id: string): ProductItem {
    const item = this.products.find(p => p.id === id);
    if (!item) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return item;
  }

  reserveVariantStock(variantId: string, qty: number): boolean {
    for (const prod of this.products) {
      const v = prod.variants.find(item => item.id === variantId);
      if (v) {
        if (v.stockOnHand - v.stockReserved >= qty) {
          v.stockReserved += qty;
          return true;
        }
        return false;
      }
    }
    return false;
  }
}
