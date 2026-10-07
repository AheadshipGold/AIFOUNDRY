"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../../landing.css";

interface CashbookEntryItem {
  id: string;
  type: "ENCAISSEMENT" | "DECAISSEMENT" | "VENTE_A_CREDIT";
  label: string;
  channel: string;
  amountMinor: number;
  currency: string;
  reference: string;
  time: string;
}

interface DayClosureItem {
  id: string;
  date: string;
  totalVenduMinor: number;
  totalEncaisseMinor: number;
  totalRestantMinor: number;
  varianceMinor: number;
  status: "EQUILIBRE" | "ECART_SIGNALE";
  closedBy: string;
  closedAt: string;
}

export default function StandaloneCashbookPage() {
  const [entries, setEntries] = useState<CashbookEntryItem[]>([]);
  const [closures, setClosures] = useState<DayClosureItem[]>([]);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [physicalCashFcfa, setPhysicalCashFcfa] = useState("");
  const [operatorName, setOperatorName] = useState("Commerçant Vendeur");
  const [closeSuccess, setCloseSuccess] = useState<any>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/v1/seller/cashbook")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.recentEntries) setEntries(data.recentEntries);
        if (data && data.history) setClosures(data.history);
      })
      .catch(() => {});
  }, []);

  // Compute FinOps Totals
  let totalVendu = 0;
  let totalEncaisse = 0;
  let totalRestant = 0;

  for (const e of entries) {
    if (e.type === "ENCAISSEMENT") {
      totalVendu += e.amountMinor;
      totalEncaisse += e.amountMinor;
    } else if (e.type === "VENTE_A_CREDIT") {
      totalVendu += e.amountMinor;
      totalRestant += e.amountMinor;
    }
  }

  const handlePerformClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    const countMinor = parseInt(physicalCashFcfa.replace(/\s+/g, ""), 10) * 100 || totalEncaisse;
    try {
      const res = await fetch("http://localhost:3001/api/v1/seller/cashbook/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          physicalCashMinor: countMinor,
          closedBy: operatorName,
          notes: "Clôture de caisse conforme",
        }),
      });
      if (res.ok) {
        const cls = await res.json();
        setCloseSuccess(cls);
        setClosures([cls, ...closures]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportFec = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/seller/cashbook/export-fec");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.content], { type: data.mimeType || "text/plain;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        setExportMessage(`Fichier FEC ${data.filename} téléchargé avec succès.`);
        setTimeout(() => setExportMessage(null), 4000);
      }
    } catch (err) {
      console.error("Export FEC failed", err);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/seller/cashbook/export-csv");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.content], { type: data.mimeType || "text/csv;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        setExportMessage(`Fichier CSV ${data.filename} téléchargé avec succès.`);
        setTimeout(() => setExportMessage(null), 4000);
      }
    } catch (err) {
      console.error("Export CSV failed", err);
    }
  };

  return (
    <div className="landing-root">
      {/* Top Luxury Bar */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand-link">
            <div className="brand-symbol">Ọ</div>
            <div className="brand-text-block">
              <span className="brand-title">OJAR盤KET</span>
              <span className="brand-sub">FINOPS OS · LIVRE DE CAISSE MARCHAND</span>
            </div>
          </Link>
          <div className="landing-header-actions">
            <Link href="/" className="btn-portal-secondary">
              ← Boutique Publique
            </Link>
          </div>
        </div>
      </header>

      {/* Main FinOps Workspace */}
      <main className="landing-container" style={{ padding: "40px 24px", maxWidth: "1240px", margin: "0 auto" }}>
        {/* Toast notification if exported */}
        {exportMessage && (
          <div style={{ backgroundColor: "#075D49", color: "#FFF", padding: "12px 20px", borderRadius: "8px", marginBottom: "20px", fontWeight: 600, fontSize: "14px" }}>
            ✓ {exportMessage}
          </div>
        )}

        {/* Title & Action */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#AD8455", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              GESTION FINANCIÈRE MARCHAND (S43 / S44)
            </div>
            <h1 style={{ margin: "8px 0 0", fontSize: "28px", color: "var(--oj-text-primary)", fontFamily: "Playfair Display, Georgia, serif" }}>
              Livre de Caisse & Rapprochement Bancaire
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleExportFec}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #AD8455",
                color: "#AD8455",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Exporter FEC (SYSCOHADA)
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--oj-border)",
                color: "var(--oj-text-primary)",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Exporter CSV
            </button>
            <button
              type="button"
              onClick={() => setCloseModalOpen(true)}
              className="btn-portal-primary"
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Clôturer la caisse du jour
              </span>
            </button>
          </div>
        </div>

        {/* The 3 Golden FinOps Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "36px" }}>
          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--oj-border)",
              backgroundColor: "var(--oj-surface)",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--oj-text-secondary)", letterSpacing: "0.08em" }}>
              1. TOTAL VENDU (COMMANDES FACTURÉES)
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: "var(--oj-text-primary)", margin: "12px 0 6px", fontVariantNumeric: "tabular-nums" }}>
              {(totalVendu / 100).toLocaleString("fr-FR")} FCFA
            </div>
            <div style={{ fontSize: "13px", color: "var(--oj-text-secondary)" }}>
              Engagements contractuels fermes passés par les acheteurs
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "2px solid #075D49",
              backgroundColor: "rgba(7, 93, 73, 0.04)",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#075D49", letterSpacing: "0.08em" }}>
              2. TOTAL ENCAISSÉ (CASH DISPONIBLE)
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: "#075D49", margin: "12px 0 6px", fontVariantNumeric: "tabular-nums" }}>
              {(totalEncaisse / 100).toLocaleString("fr-FR")} FCFA
            </div>
            <div style={{ fontSize: "13px", color: "#075D49" }}>
              Fonds physiquement confirmés sur MoMo et en tiroir-caisse
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--oj-border)",
              backgroundColor: "var(--oj-surface)",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#D97706", letterSpacing: "0.08em" }}>
              3. RESTE À RECOUVRER (CRÉANCES / SOLDE)
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: "#D97706", margin: "12px 0 6px", fontVariantNumeric: "tabular-nums" }}>
              {(totalRestant / 100).toLocaleString("fr-FR")} FCFA
            </div>
            <div style={{ fontSize: "13px", color: "var(--oj-text-secondary)" }}>
              Acomptes restants exigibles à la livraison ou solde de commande
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <section style={{ backgroundColor: "var(--oj-surface)", borderRadius: "14px", border: "1px solid var(--oj-border)", padding: "24px", marginBottom: "36px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--oj-text-primary)", margin: "0 0 16px 0", fontFamily: "Playfair Display, Georgia, serif" }}>
            Journal des Écritures Immédiates ({entries.length})
          </h2>
          {entries.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--oj-border)", color: "var(--oj-text-secondary)" }}>
                    <th style={{ padding: "10px 12px" }}>HEURE</th>
                    <th style={{ padding: "10px 12px" }}>LIBELLÉ OPÉRATION</th>
                    <th style={{ padding: "10px 12px" }}>CANAL</th>
                    <th style={{ padding: "10px 12px" }}>RÉFÉRENCE</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>MONTANT (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: "1px solid var(--oj-border)" }}>
                      <td style={{ padding: "12px", color: "var(--oj-text-secondary)" }}>{entry.time}</td>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--oj-text-primary)" }}>{entry.label}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "3px 8px", backgroundColor: "rgba(173,132,85,0.12)", color: "#AD8455", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                          {entry.channel}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "var(--oj-text-secondary)" }}>{entry.reference || "—"}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: entry.type === "DECAISSEMENT" ? "#DC2626" : "#075D49" }}>
                        {entry.type === "DECAISSEMENT" ? "-" : "+"}
                        {(Math.abs(entry.amountMinor) / 100).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--oj-text-secondary)" }}>
              Aucune transaction enregistrée pour cette journée.
            </div>
          )}
        </section>

        {/* History of Day Closures */}
        <section style={{ backgroundColor: "var(--oj-surface)", borderRadius: "14px", border: "1px solid var(--oj-border)", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--oj-text-primary)", margin: "0 0 16px 0", fontFamily: "Playfair Display, Georgia, serif" }}>
            Historique des Clôtures Certifiées ({closures.length})
          </h2>
          {closures.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--oj-border)", color: "var(--oj-text-secondary)" }}>
                    <th style={{ padding: "10px 12px" }}>DATE</th>
                    <th style={{ padding: "10px 12px" }}>TOTAL ENCAISSÉ</th>
                    <th style={{ padding: "10px 12px" }}>STATUT CAISSE</th>
                    <th style={{ padding: "10px 12px" }}>OPÉRATEUR</th>
                    <th style={{ padding: "10px 12px" }}>DATE & HEURE</th>
                  </tr>
                </thead>
                <tbody>
                  {closures.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--oj-border)" }}>
                      <td style={{ padding: "12px", fontWeight: 600 }}>{c.date}</td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "#075D49" }}>
                        {(c.totalEncaisseMinor / 100).toLocaleString("fr-FR")} FCFA
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "3px 8px", backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                          ✓ {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "var(--oj-text-secondary)" }}>{c.closedBy}</td>
                      <td style={{ padding: "12px", color: "var(--oj-text-secondary)" }}>{new Date(c.closedAt).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--oj-text-secondary)" }}>
              Aucune clôture de caisse précédente enregistrée.
            </div>
          )}
        </section>
      </main>

      {/* Modal Clôture */}
      {closeModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#FFF", borderRadius: "14px", padding: "32px", maxWidth: "480px", width: "90%" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#1A1A1A", fontFamily: "serif" }}>
              Clôturer la journée de caisse
            </h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              Saisissez le montant d’espèces physiques présent dans le tiroir-caisse pour certifier la concordance avec les écritures.
            </p>
            <form onSubmit={handlePerformClosure}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#333", marginBottom: "6px" }}>
                  MONTANT PHYSIQUE EN CAISSE (FCFA)
                </label>
                <input
                  type="text"
                  placeholder={(totalEncaisse / 100).toLocaleString("fr-FR")}
                  value={physicalCashFcfa}
                  onChange={(e) => setPhysicalCashFcfa(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #CCC", fontSize: "16px", fontWeight: 600 }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#333", marginBottom: "6px" }}>
                  RESPONSABLE DE CAISSE
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #CCC", fontSize: "14px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(false)}
                  style={{ padding: "10px 16px", borderRadius: "6px", border: "1px solid #CCC", backgroundColor: "#FFF", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "6px", backgroundColor: "#075D49", color: "#FFF", fontWeight: 600, border: "none", cursor: "pointer" }}
                >
                  Confirmer la Clôture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
