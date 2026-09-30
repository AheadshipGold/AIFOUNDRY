import { BadRequestException, Injectable } from '@nestjs/common';

export interface FinOpsEntry {
  id: string;
  type: 'ENCAISSEMENT' | 'DECAISSEMENT' | 'VENTE_A_CREDIT';
  label: string;
  channel: 'MTN MoMo' | 'Moov Money' | 'Celtiis Cash' | 'Espèces' | 'Virement';
  amountMinor: number;
  currency: string;
  reference: string;
  time: string;
}

export interface DayClosureRecord {
  id: string;
  date: string;
  totalVenduMinor: number;
  totalEncaisseMinor: number;
  totalRestantMinor: number;
  varianceMinor: number;
  status: 'EQUILIBRE' | 'ECART_SIGNALE';
  closedBy: string;
  closedAt: string;
}

@Injectable()
export class SellerService {
  private entries: FinOpsEntry[] = [
    {
      id: 'fin-01',
      type: 'ENCAISSEMENT',
      label: 'Commande OJK-2026-0891 (Sac Cabas Grand Marché)',
      channel: 'MTN MoMo',
      amountMinor: 18500000,
      currency: 'XOF',
      reference: 'TXN-MTN-89021',
      time: '14:32',
    },
    {
      id: 'fin-02',
      type: 'ENCAISSEMENT',
      label: 'Vente directe comptoir — Porte-carte cuir cognac',
      channel: 'Espèces',
      amountMinor: 4500000,
      currency: 'XOF',
      reference: 'REC-CPT-004',
      time: '11:15',
    },
    {
      id: 'fin-03',
      type: 'DECAISSEMENT',
      label: 'Achat peaux brutes tannerie Djougou',
      channel: 'Espèces',
      amountMinor: -8000000,
      currency: 'XOF',
      reference: 'EXP-TAN-012',
      time: '09:40',
    },
    {
      id: 'fin-04',
      type: 'VENTE_A_CREDIT',
      label: 'Commande Galerie Royale — Solde à livraison',
      channel: 'Virement',
      amountMinor: 12000000,
      currency: 'XOF',
      reference: 'CMD-GAL-990',
      time: '09:10',
    },
  ];

  private closures: DayClosureRecord[] = [
    {
      id: 'cls-2026-09-29',
      date: '2026-09-29',
      totalVenduMinor: 38500000,
      totalEncaisseMinor: 26500000,
      totalRestantMinor: 12000000,
      varianceMinor: 0,
      status: 'EQUILIBRE',
      closedBy: 'Atelier Ganvié',
      closedAt: '2026-09-29T19:45:00Z',
    }
  ];

  getDashboardMetrics() {
    let encaisse = 0;
    let vendu = 0;
    let restant = 0;

    for (const e of this.entries) {
      if (e.type === 'ENCAISSEMENT') {
        encaisse += e.amountMinor;
        vendu += e.amountMinor;
      } else if (e.type === 'VENTE_A_CREDIT') {
        vendu += e.amountMinor;
        restant += e.amountMinor;
      }
    }

    return {
      kpis: {
        caVenduMinor: vendu,
        caEncaisseMinor: encaisse,
        restantDuMinor: restant,
        commandesJour: 6,
        alertesStock: 2,
      },
      priorities: [
        { id: 'p-1', text: 'Expédier commande OJK-2026-0891 vers Haie Vive (Cotonou)', due: 'Avant 17h', type: 'urgent' },
        { id: 'p-2', text: 'Réapprovisionner cuir pleine fleur ébène (Stock résiduel : 1)', due: 'Demain', type: 'warning' },
        { id: 'p-3', text: 'Répondre à la demande sur-mesure D02 "Parure Abomey"', due: 'Sous 4h', type: 'info' },
      ],
    };
  }

  getCashbook() {
    return {
      entries: this.entries,
      dayClosures: this.closures,
    };
  }

  closeDay(dto: { physicalCashMinor: number; closedBy: string; notes?: string }) {
    const metrics = this.getDashboardMetrics();
    const expectedCashMinor = metrics.kpis.caEncaisseMinor;
    const variance = dto.physicalCashMinor - expectedCashMinor;

    const closure: DayClosureRecord = {
      id: `cls-${new Date().toISOString().slice(0, 10)}`,
      date: new Date().toISOString().slice(0, 10),
      totalVenduMinor: metrics.kpis.caVenduMinor,
      totalEncaisseMinor: metrics.kpis.caEncaisseMinor,
      totalRestantMinor: metrics.kpis.restantDuMinor,
      varianceMinor: variance,
      status: variance === 0 ? 'EQUILIBRE' : 'ECART_SIGNALE',
      closedBy: dto.closedBy || 'Responsable de Caisse',
      closedAt: new Date().toISOString(),
    };

    this.closures.unshift(closure);
    return closure;
  }
}
