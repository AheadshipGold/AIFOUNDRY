"use client";

import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { AdminIconFileText } from "../components/shared/AdminIcons";
import { DisputeItem } from "../types";

const apiBase = '/api/v1';

export function DisputesView() {
  const { isEn } = useAdmin();

  const [disputes, setDisputes] = useState<DisputeItem[]>([
    {
      id: "inc-01",
      orderId: "cmd-mock-01",
      orderNumber: "CMD-2847",
      reporterName: "Amina Diop",
      reporterPhone: "+229 97 00 11 22",
      category: "DELAY_EXCEEDED",
      title: "Retard de livraison sur Cotonou",
      description: "La commande devait être livrée sous 10 jours. Demande de clarification auprès de la boutique.",
      evidenceUrls: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80"],
      status: "UNDER_REVIEW",
      proposedOutcome: "Remplacement prioritaire sous 48h et geste commercial de 10 000 FCFA.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  const [disputeFilter, setDisputeFilter] = useState<string>("ALL");

  const handleArbitrateDispute = async (id: string, resolution: string, proposedOutcome?: string) => {
    try {
      await fetch(`${apiBase}/incidents/${id}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, proposedOutcome }),
      });
    } catch {}

    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "RESOLVED",
              resolution,
              proposedOutcome: proposedOutcome || d.proposedOutcome,
              resolvedAt: new Date().toISOString(),
            }
          : d
      )
    );
  };

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "Disputes & Tripartite Arbitration (A04)" : "Médiation & Arbitrage des Litiges (A04)"}</h1>
          <p>
            {isEn
              ? "Tripartite mediation between buyer, merchant store, and platform conciliation supervisor."
              : "Résolution tripartite des réclamations : examen des preuves, offres de conciliation et arbitrage officiel."}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="oj-admin-filter-bar">
        <div style={{ display: "flex", gap: "8px" }}>
          {(["ALL", "UNDER_REVIEW", "PROPOSAL_MADE", "RESOLVED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setDisputeFilter(st)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: disputeFilter === st ? 700 : 500,
                border: "1px solid var(--oj-color-border)",
                background: disputeFilter === st ? "var(--oj-color-action)" : "var(--oj-color-surface)",
                color: disputeFilter === st ? "#FFFFFF" : "var(--oj-color-text)",
                cursor: "pointer",
              }}
            >
              {st === "ALL"
                ? isEn ? "All Disputes" : "Tous les Litiges"
                : st === "UNDER_REVIEW"
                ? isEn ? "In Review" : "En Examen"
                : st === "PROPOSAL_MADE"
                ? isEn ? "Proposal Offered" : "Proposition Marchande"
                : isEn ? "Resolved" : "Résolus"}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {disputes
          .filter((d) => disputeFilter === "ALL" || d.status === disputeFilter)
          .map((d) => (
            <div
              key={d.id}
              className="oj-admin-table-card"
              style={{
                padding: "24px",
                borderLeft: d.status === "RESOLVED" ? "4px solid #10B981" : "4px solid #AD8455",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#AD8455", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    COMMANDE {d.orderNumber || d.orderId} · {d.category}
                  </div>
                  <h3 style={{ margin: "4px 0", fontSize: "18px", color: "var(--oj-color-text)" }}>
                    {d.title}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>
                    Signalé par <strong>{d.reporterName}</strong> {d.reporterPhone ? `(${d.reporterPhone})` : ""} · {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <span className={`oj-status-pill ${d.status === "RESOLVED" ? "success" : d.status === "PROPOSAL_MADE" ? "pending" : "error"}`}>
                  {d.status === "RESOLVED"
                    ? "✓ ARBITRÉ & CLOS"
                    : d.status === "PROPOSAL_MADE"
                    ? "PROPOSITION FAITE"
                    : "EN INSTRUCTION"}
                </span>
              </div>

              <p style={{ fontSize: "14px", color: "var(--oj-color-text)", lineHeight: 1.5, margin: "10px 0 16px" }}>
                {d.description}
              </p>

              {/* Evidence URLs */}
              {d.evidenceUrls && d.evidenceUrls.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--oj-color-muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                    Pièces Justificatives Téléversées :
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {d.evidenceUrls.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          backgroundColor: "var(--oj-color-subtle)",
                          border: "1px solid var(--oj-color-border)",
                          fontSize: "12px",
                          color: "var(--oj-color-action)",
                          textDecoration: "none",
                        }}
                      >
                        <span><AdminIconFileText size={12} /></span>
                        <span>Preuve #{idx + 1} (Ouvrir ↗)</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Merchant Proposal */}
              {d.proposedOutcome && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(173, 132, 85, 0.1)",
                    border: "1px solid rgba(173, 132, 85, 0.3)",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#AD8455", textTransform: "uppercase" }}>
                    Proposition de Règlement formulée par la Boutique :
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--oj-color-text)", marginTop: "4px" }}>
                    {d.proposedOutcome}
                  </div>
                </div>
              )}

              {/* Final Resolution if already resolved */}
              {d.resolution && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#075D49", textTransform: "uppercase" }}>
                    Décision d'Arbitrage Officielle :
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--oj-color-text)", marginTop: "4px" }}>
                    {d.resolution}
                  </div>
                </div>
              )}

              {/* Moderator Action Buttons */}
              {d.status !== "RESOLVED" && (
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid var(--oj-color-border)" }}>
                  <button
                    className="oj-btn-primary"
                    style={{ height: "34px", padding: "0 14px", fontSize: "12px" }}
                    onClick={() =>
                      handleArbitrateDispute(
                        d.id,
                        "Arbitrage en faveur de l'acheteur : Remboursement intégral ou remplacement validé par la modération.",
                        "Remboursement / Remplacement Conforme"
                      )
                    }
                  >
                    Arbitrer en faveur de l'Acheteur
                  </button>
                  <button
                    className="oj-btn-secondary"
                    style={{ height: "34px", padding: "0 14px", fontSize: "12px", color: "#AD8455", borderColor: "#AD8455" }}
                    onClick={() =>
                      handleArbitrateDispute(
                        d.id,
                        `Accord amiable validé d'après la proposition de la boutique : ${d.proposedOutcome || "Geste commercial validé"}.`,
                        d.proposedOutcome || "Accord Amiable Validé"
                      )
                    }
                  >
                    Valider la Proposition Boutique
                  </button>
                  <button
                    className="oj-btn-secondary"
                    style={{ height: "34px", padding: "0 14px", fontSize: "12px", color: "#B42C3E", borderColor: "rgba(180,44,62,0.4)" }}
                    onClick={() =>
                      handleArbitrateDispute(
                        d.id,
                        "Réclamation non fondée après analyse des pièces. Commande confirmée conforme.",
                        "Clôture sans suite"
                      )
                    }
                  >
                    Rejeter le Litige
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
