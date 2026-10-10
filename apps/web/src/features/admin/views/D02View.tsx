"use client";

import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { AuthApi } from "../../../lib/api";

export function D02View() {
  const { isEn } = useAdmin();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await AuthApi.executeFetch("/api/v1/admin/d02");
        if (Array.isArray(data)) {
          setRequests(data);
        }
      } catch (error) {
        console.error("Failed to fetch D02 requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

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
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                  {isEn ? "Loading..." : "Chargement..."}
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                  {isEn ? "No bespoke requests found." : "Aucune demande sur-mesure trouvée."}
                </td>
              </tr>
            ) : (
              requests.map((r, i) => (
                <tr key={r.id || i}>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td style={{ color: "var(--oj-color-muted)" }}>{r.buyer?.name || "Unknown"}</td>
                  <td><span className="oj-status-pill success">{r.category}</span></td>
                  <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {r.targetBudgetMinor ? `${(r.targetBudgetMinor).toLocaleString()} ${r.currency}` : "N/A"}
                  </td>
                  <td><strong>{r.proposals?.length || 0} devis</strong></td>
                  <td><span className="oj-status-pill pending">{r.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
