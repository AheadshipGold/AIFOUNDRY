"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";

export function FinOpsView() {
  const { isEn } = useAdmin();

  const formatPrice = (val: number, cur = "XOF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("XOF", "FCFA");
  };

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "Merchant FinOps & Cashbook Ledger (S44)" : "Livre de Caisse & Rapprochement FinOps"}</h1>
          <p>
            {isEn
              ? "Triad monitoring: Total Gross Sold != Amount Collected != Remaining Receivable. Append-only events."
              : "Surveillance de la triade : Vendu ≠ Encaissé ≠ Restant. Grand livre immuable non-custodial."}
          </p>
        </div>
      </div>

      {/* Triade summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
          <div className="oj-kpi-header"><span>Chiffre d'Affaires Engagé (Vendu)</span></div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>1 280 000 FCFA</strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Total des commandes fermes</small>
        </div>
        <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
          <div className="oj-kpi-header"><span>Liquidités Encaissées (Direct MoMo/Comptoir)</span></div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#185F46" }}>850 000 FCFA</strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Relevés de caisse confirmés</small>
        </div>
        <div className="oj-kpi-card" style={{ borderLeft: "4px solid #AD8455" }}>
          <div className="oj-kpi-header"><span>{isEn ? "Pending Client Receivables" : "Créances Clients en Attente"}</span></div>
          <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#AD8455" }}>430 000 FCFA</strong>
          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Soldes à percevoir à livraison</small>
        </div>
      </div>

      {/* Recent FinOps flows */}
      <div className="oj-admin-table-card">
        <table className="oj-admin-table">
          <thead>
            <tr>
              <th>{isEn ? "Label & Reference" : "Libellé & Référence"}</th>
              <th>{isEn ? "Payment Channel" : "Canal de Paiement"}</th>
              <th>{isEn ? "Time" : "Heure"}</th>
              <th>{isEn ? "Audit Status" : "Statut Audit"}</th>
              <th style={{ textAlign: "right" }}>Montant Encaissé</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Commande OJK-2026-0891 (Sac Cabas Grand Marché)", ref: "TXN-MTN-89021", channel: "MTN Mobile Money", time: "14:32", status: "Confirmé par PSP", amount: 185000 },
              { label: "Vente directe comptoir — Porte-carte cuir cognac", ref: "REC-CPT-004", channel: "Espèces", time: "11:15", status: "Confirmé par vendeur", amount: 45000 },
              { label: "Commande Galerie Royale — Solde à livraison", ref: "CMD-GAL-990", channel: "Virement", time: "09:10", status: "Créance en attente", amount: 120000 },
            ].map((row, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 600 }}>{row.label}</div>
                  <small style={{ color: "var(--oj-color-muted)" }}>{row.ref}</small>
                </td>
                <td>{row.channel}</td>
                <td style={{ color: "var(--oj-color-muted)" }}>{row.time}</td>
                <td><span className="oj-status-pill success">{row.status}</span></td>
                <td style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {formatPrice(row.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
