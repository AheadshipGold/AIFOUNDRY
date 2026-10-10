"use client";

import React from "react";
import { useAdmin } from "../context/AdminContext";

export function D02View() {
  const { isEn } = useAdmin();

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "Bespoke Requests & Quotes (D02)" : "Supervision des Demandes Sur-Mesure"}</h1>
          <p>
            {isEn
              ? "Track buyer demand structuring, store response rates, and awarded orders."
              : "Suivi des demandes acheteurs, taux de réponse des boutiques et commandes issues de devis."}
          </p>
        </div>
      </div>

      <div className="oj-admin-table-card">
        <table className="oj-admin-table">
          <thead>
            <tr>
              <th>{isEn ? "Request Title" : "Demande Sur-Mesure"}</th>
              <th>{isEn ? "Buyer" : "Acheteur"}</th>
              <th>{isEn ? "Category" : "Catégorie"}</th>
              <th>{isEn ? "Target Budget" : "Budget indicatif"}</th>
              <th>{isEn ? "Quotes Submitted" : "Devis Reçus"}</th>
              <th>{isEn ? "Status" : "Statut"}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { title: "Parure de haute joaillerie en bronze ciselé", buyer: "Amina Diop (Cotonou)", cat: "Joaillerie & Bronze", budget: "280 000 FCFA", quotes: 2, status: "MATCHED" },
              { title: "Table console sculptée en bois d'Iroko massif", buyer: "Marcelle Houngbo (Porto-Novo)", cat: "Mobilier d'Art", budget: "450 000 FCFA", quotes: 1, status: "MATCHED" },
              { title: "Sac de voyage weekend en cuir pleine fleur patiné", buyer: "Didier Agossa (Parakou)", cat: "Maroquinerie", budget: "190 000 FCFA", quotes: 0, status: "OPEN" },
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.title}</td>
                <td style={{ color: "var(--oj-color-muted)" }}>{r.buyer}</td>
                <td><span className="oj-status-pill success">{r.cat}</span></td>
                <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{r.budget}</td>
                <td><strong>{r.quotes} devis</strong></td>
                <td><span className="oj-status-pill pending">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
