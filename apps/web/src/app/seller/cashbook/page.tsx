"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredToken, getStoredUser } from "@/lib/api";

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
  const [loading, setLoading] = useState(true);

  // New Entry Modal
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"ENCAISSEMENT" | "DECAISSEMENT">("ENCAISSEMENT");
  const [entryAmountFcfa, setEntryAmountFcfa] = useState("");
  const [entryChannel, setEntryChannel] = useState("CASH_ON_DELIVERY");
  const [entryLabel, setEntryLabel] = useState("");
  const [entryReference, setEntryReference] = useState("");
  const [entrySubmitting, setEntrySubmitting] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);

  // Closure Modal
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [physicalCashFcfa, setPhysicalCashFcfa] = useState("");
  const [operatorName, setOperatorName] = useState("Commerçant Vendeur");
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadCashbook = () => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
    };

    fetch("/api/v1/seller/cashbook", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.recentEntries) setEntries(data.recentEntries);
        if (data && data.history) setClosures(data.history);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCashbook();
  }, []);

  // Compute FinOps Totals
  let totalVendu = 0;
  let totalEncaisse = 0;
  let totalRestant = 0;

  for (const e of entries) {
    if (e.type === "ENCAISSEMENT") {
      totalVendu += e.amountMinor;
      totalEncaisse += e.amountMinor;
    } else if (e.type === "DECAISSEMENT") {
      totalEncaisse -= Math.abs(e.amountMinor);
    } else if (e.type === "VENTE_A_CREDIT") {
      totalVendu += e.amountMinor;
      totalRestant += e.amountMinor;
    }
  }

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntryError(null);

    const amountNum = parseInt(entryAmountFcfa.replace(/\D/g, ""), 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setEntryError("Veuillez saisir un montant valide supérieur à 0 FCFA.");
      return;
    }

    if (!entryLabel.trim()) {
      setEntryError("Veuillez préciser le libellé de l'opération.");
      return;
    }

    setEntrySubmitting(true);
    const token = getStoredToken();

    try {
      const res = await fetch("/api/v1/seller/cashbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amountMinor: amountNum * 100,
          type: entryType,
          channel: entryChannel,
          label: entryLabel.trim(),
          reference: entryReference.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'enregistrement de l'écriture");
      }

      if (data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
      } else {
        loadCashbook();
      }

      setEntryModalOpen(false);
      setEntryAmountFcfa("");
      setEntryLabel("");
      setEntryReference("");
      showNotification("Écriture de caisse enregistrée avec succès.");
    } catch (err: any) {
      setEntryError(err.message || "Échec de l'enregistrement");
    } finally {
      setEntrySubmitting(false);
    }
  };

  const handlePerformClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloseSubmitting(true);
    const token = getStoredToken();
    const countMinor = parseInt(physicalCashFcfa.replace(/\D/g, ""), 10) * 100 || Math.max(0, totalEncaisse);

    try {
      const res = await fetch("/api/v1/seller/cashbook/close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          physicalCashMinor: countMinor,
          closedBy: operatorName.trim() || "Commerçant Vendeur",
          notes: "Clôture journalière certifiée de caisse",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur de clôture");
      }

      const cls = await res.json();
      setClosures([cls, ...closures]);
      setCloseModalOpen(false);
      setPhysicalCashFcfa("");
      showNotification("Caisse du jour clôturée et certifiée dans le grand livre.");
    } catch (err: any) {
      showNotification(err.message || "Erreur lors de la clôture", "error");
    } finally {
      setCloseSubmitting(false);
    }
  };

  const handleExportFec = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch("/api/v1/seller/cashbook/export-fec", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.content], { type: data.mimeType || "text/plain;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification(`Fichier FEC ${data.filename} téléchargé avec succès.`);
      }
    } catch (err) {
      showNotification("Échec du téléchargement FEC", "error");
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch("/api/v1/seller/cashbook/export-csv", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.content], { type: data.mimeType || "text/csv;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification(`Fichier CSV ${data.filename} téléchargé avec succès.`);
      }
    } catch (err) {
      showNotification("Échec du téléchargement CSV", "error");
    }
  };

  const formatChannelBadge = (ch: string) => {
    switch (ch) {
      case "CASH_ON_DELIVERY":
      case "CASH":
      case "PICKUP":
        return { label: "Espèces (Tiroir-caisse)", color: "#10B981" };
      case "MTN_MOMO":
        return { label: "MTN MoMo", color: "#F59E0B" };
      case "MOOV_MONEY":
        return { label: "Moov Money", color: "#3B82F6" };
      case "CELTIIS_CASH":
        return { label: "Celtiis Cash", color: "#8B5CF6" };
      case "DIRECT_TRANSFER":
        return { label: "Virement Bancaire", color: "#D4B483" };
      case "CARD":
        return { label: "Carte Bancaire", color: "#06B6D4" };
      default:
        return { label: ch, color: "#AD8455" };
    }
  };

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            backgroundColor: notification.type === "error" ? "rgba(229, 115, 115, 0.95)" : "#075D49",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: 600,
            fontSize: "13.5px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {notification.type === "error" ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <polyline points="20 6 9 17 4 12" />
            )}
          </svg>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#D4B483", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Audit &amp; Finances Marchandes
          </div>
          <h1 style={{ margin: "8px 0 0", fontSize: "28px", color: "#F8F6F0", fontFamily: "var(--oj-font-editorial, serif)" }}>
            Livre de Caisse &amp; Rapprochement FinOps
          </h1>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* New Entry Button */}
          <button
            type="button"
            onClick={() => setEntryModalOpen(true)}
            className="seller-action-btn"
            style={{ padding: "10px 18px", fontSize: "13px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ Enregistrer une Écriture</span>
          </button>

          {/* Close Day Button */}
          <button
            type="button"
            onClick={() => setCloseModalOpen(true)}
            className="seller-secondary-btn"
            style={{ padding: "10px 18px", fontSize: "13px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Clôturer la Caisse</span>
          </button>

          {/* Export FEC */}
          <button
            type="button"
            onClick={handleExportFec}
            className="seller-secondary-btn"
            style={{ padding: "10px 16px", fontSize: "12.5px" }}
            title="Exporter pour comptabilité OHADA / SYSCOHADA"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>FEC (SYSCOHADA)</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="seller-secondary-btn"
            style={{ padding: "10px 16px", fontSize: "12.5px" }}
          >
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* The 3 Golden FinOps Pillars (Harmonized Luxury Cards) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "36px" }}>
        {/* Card 1: Total Vendu */}
        <div
          className="seller-card"
          style={{
            padding: "24px",
            background: "linear-gradient(180deg, #111C1A 0%, #0D1614 100%)",
            border: "1px solid rgba(212, 180, 131, 0.25)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#D4B483", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            1. Total Vendu (Commandes Facturées)
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#F8F6F0", margin: "12px 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {(totalVendu / 100).toLocaleString("fr-FR")} FCFA
          </div>
          <div style={{ fontSize: "12.5px", color: "rgba(248, 246, 240, 0.65)", lineHeight: "1.5" }}>
            Engagements contractuels fermes passés par les acheteurs
          </div>
        </div>

        {/* Card 2: Total Encaissé */}
        <div
          className="seller-card"
          style={{
            padding: "24px",
            background: "linear-gradient(180deg, #0A241E 0%, #061A15 100%)",
            border: "1.5px solid rgba(16, 185, 129, 0.45)",
            boxShadow: "0 8px 24px rgba(7, 93, 73, 0.2)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#34D399", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            2. Total Encaissé (Cash Disponible)
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#10B981", margin: "12px 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {(totalEncaisse / 100).toLocaleString("fr-FR")} FCFA
          </div>
          <div style={{ fontSize: "12.5px", color: "rgba(52, 211, 153, 0.85)", lineHeight: "1.5" }}>
            Fonds physiquement confirmés sur MoMo et en tiroir-caisse
          </div>
        </div>

        {/* Card 3: Reste à Recouvrer */}
        <div
          className="seller-card"
          style={{
            padding: "24px",
            background: "linear-gradient(180deg, #1A1812 0%, #12100A 100%)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#FBBF24", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            3. Reste à Recouvrer (Créances / Solde)
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#F59E0B", margin: "12px 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {(totalRestant / 100).toLocaleString("fr-FR")} FCFA
          </div>
          <div style={{ fontSize: "12.5px", color: "rgba(251, 191, 36, 0.75)", lineHeight: "1.5" }}>
            Acomptes restants exigibles à la livraison ou solde de commande
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="seller-card" style={{ padding: "24px", marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F8F6F0", margin: "0 0 4px 0", fontFamily: "var(--oj-font-editorial, serif)" }}>
              Journal des Écritures Immédiates ({entries.length})
            </h2>
            <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(248, 246, 240, 0.65)" }}>
              Écritures de caisse, ventes directes au comptoir et règlements par mobile money.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEntryModalOpen(true)}
            className="seller-secondary-btn"
            style={{ padding: "8px 14px", fontSize: "12px" }}
          >
            + Nouvelle Écriture
          </button>
        </div>

        {entries.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#D4B483", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 14px" }}>Heure</th>
                  <th style={{ padding: "12px 14px" }}>Libellé Opération</th>
                  <th style={{ padding: "12px 14px" }}>Canal</th>
                  <th style={{ padding: "12px 14px" }}>Référence</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Montant (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const badge = formatChannelBadge(entry.channel);
                  const isExpense = entry.type === "DECAISSEMENT";
                  return (
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "14px", color: "rgba(248, 246, 240, 0.65)", fontVariantNumeric: "tabular-nums" }}>
                        {entry.time}
                      </td>
                      <td style={{ padding: "14px", fontWeight: 600, color: "#F8F6F0" }}>
                        {entry.label}
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            padding: "3px 9px",
                            backgroundColor: `${badge.color}1A`,
                            color: badge.color,
                            border: `1px solid ${badge.color}40`,
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px", color: "rgba(248, 246, 240, 0.65)", fontVariantNumeric: "tabular-nums" }}>
                        {entry.reference || "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px",
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: "14px",
                          fontVariantNumeric: "tabular-nums",
                          color: isExpense ? "#EF5350" : "#10B981",
                        }}
                      >
                        {isExpense ? "-" : "+"}
                        {(Math.abs(entry.amountMinor) / 100).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              borderRadius: "10px",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              border: "1px dashed rgba(212, 180, 131, 0.25)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 14px",
                borderRadius: "50%",
                backgroundColor: "rgba(212, 180, 131, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D4B483",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="12" x2="18" y2="12" />
              </svg>
            </div>
            <h3 style={{ fontSize: "16px", color: "#F8F6F0", margin: "0 0 6px 0", fontFamily: "var(--oj-font-editorial, serif)" }}>
              Aucune écriture de caisse enregistrée
            </h3>
            <p style={{ color: "rgba(248, 246, 240, 0.6)", fontSize: "13px", maxWidth: "440px", margin: "0 auto 20px" }}>
              Enregistrez vos encaissements d'espèces au comptoir, règlements MoMo ou décaissements de fournitures d'atelier.
            </p>
            <button
              type="button"
              onClick={() => setEntryModalOpen(true)}
              className="seller-action-btn"
              style={{ padding: "10px 20px" }}
            >
              + Enregistrer une première écriture
            </button>
          </div>
        )}
      </section>

      {/* History of Day Closures */}
      <section className="seller-card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F8F6F0", margin: "0 0 16px 0", fontFamily: "var(--oj-font-editorial, serif)" }}>
          Historique des Clôtures Certifiées ({closures.length})
        </h2>
        {closures.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#D4B483", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 14px" }}>Date</th>
                  <th style={{ padding: "12px 14px" }}>Total Encaissé</th>
                  <th style={{ padding: "12px 14px" }}>Statut Caisse</th>
                  <th style={{ padding: "12px 14px" }}>Responsable</th>
                  <th style={{ padding: "12px 14px" }}>Date &amp; Heure de Clôture</th>
                </tr>
              </thead>
              <tbody>
                {closures.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "14px", fontWeight: 600, color: "#F8F6F0" }}>{c.date}</td>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#10B981", fontVariantNumeric: "tabular-nums" }}>
                      {(c.totalEncaisseMinor / 100).toLocaleString("fr-FR")} FCFA
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{ padding: "3px 8px", backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#34D399", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                        ✓ {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px", color: "rgba(248, 246, 240, 0.7)" }}>{c.closedBy}</td>
                    <td style={{ padding: "14px", color: "rgba(248, 246, 240, 0.7)" }}>{new Date(c.closedAt).toLocaleString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "28px", textAlign: "center", color: "rgba(248, 246, 240, 0.6)", fontSize: "13px" }}>
            Aucune clôture de caisse passée pour le moment.
          </div>
        )}
      </section>

      {/* Modal 1: Nouvelle Écriture de Caisse */}
      {entryModalOpen && (
        <div className="seller-modal-overlay" onClick={() => setEntryModalOpen(false)}>
          <div className="seller-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="seller-modal-close-btn"
              onClick={() => setEntryModalOpen(false)}
              aria-label="Fermer"
            >
              ✕
            </button>

            <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", color: "#F8F6F0", fontFamily: "var(--oj-font-editorial, serif)" }}>
              Enregistrer une Écriture de Caisse
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.7)", marginBottom: "20px" }}>
              Ajoutez un encaissement direct (vente boutique, MoMo) ou un décaissement d'atelier.
            </p>

            {entryError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(229, 115, 115, 0.15)",
                  border: "1px solid rgba(229, 115, 115, 0.4)",
                  color: "#FFCDD2",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {entryError}
              </div>
            )}

            <form onSubmit={handleCreateEntry}>
              {/* Type Switcher */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setEntryType("ENCAISSEMENT")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: entryType === "ENCAISSEMENT" ? "1.5px solid #10B981" : "1px solid rgba(255, 255, 255, 0.12)",
                    backgroundColor: entryType === "ENCAISSEMENT" ? "rgba(16, 185, 129, 0.18)" : "rgba(0, 0, 0, 0.25)",
                    color: entryType === "ENCAISSEMENT" ? "#34D399" : "rgba(248, 246, 240, 0.7)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  + Encaissement (Recette)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType("DECAISSEMENT")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: entryType === "DECAISSEMENT" ? "1.5px solid #EF5350" : "1px solid rgba(255, 255, 255, 0.12)",
                    backgroundColor: entryType === "DECAISSEMENT" ? "rgba(229, 115, 115, 0.18)" : "rgba(0, 0, 0, 0.25)",
                    color: entryType === "DECAISSEMENT" ? "#FFCDD2" : "rgba(248, 246, 240, 0.7)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  - Décaissement (Dépense)
                </button>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#D4B483", marginBottom: "6px" }}>
                  MONTANT (FCFA) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 45000"
                  value={entryAmountFcfa}
                  onChange={(e) => setEntryAmountFcfa(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "16px",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
              </div>

              {/* Label */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#D4B483", marginBottom: "6px" }}>
                  LIBELLÉ / MOTIF DE L'OPÉRATION *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vente au comptoir — Sac Ébène Cuir"
                  value={entryLabel}
                  onChange={(e) => setEntryLabel(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              {/* Channel */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#D4B483", marginBottom: "6px" }}>
                  CANAL DE RÈGLEMENT *
                </label>
                <select
                  value={entryChannel}
                  onChange={(e) => setEntryChannel(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#0B1614",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                >
                  <option value="CASH_ON_DELIVERY">Espèces (Tiroir-caisse de la boutique)</option>
                  <option value="MTN_MOMO">MTN Mobile Money</option>
                  <option value="MOOV_MONEY">Moov Money Flooz</option>
                  <option value="CELTIIS_CASH">Celtiis Cash</option>
                  <option value="DIRECT_TRANSFER">Virement Bancaire Direct</option>
                  <option value="CARD">Carte Bancaire (TPE / Visa / Mastercard)</option>
                </select>
              </div>

              {/* Reference */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "rgba(248, 246, 240, 0.7)", marginBottom: "6px" }}>
                  RÉFÉRENCE OU NUMÉRO DE REÇU (OPTIONNEL)
                </label>
                <input
                  type="text"
                  placeholder="Ex: REC-2026-084"
                  value={entryReference}
                  onChange={(e) => setEntryReference(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setEntryModalOpen(false)}
                  className="seller-secondary-btn"
                  style={{ padding: "10px 18px", fontSize: "13px" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={entrySubmitting}
                  className="seller-action-btn"
                  style={{ padding: "10px 22px", fontSize: "13px" }}
                >
                  {entrySubmitting ? "Enregistrement..." : "Confirmer l'Écriture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Clôture Journalière Certifiée */}
      {closeModalOpen && (
        <div className="seller-modal-overlay" onClick={() => setCloseModalOpen(false)}>
          <div className="seller-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="seller-modal-close-btn"
              onClick={() => setCloseModalOpen(false)}
              aria-label="Fermer"
            >
              ✕
            </button>

            <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", color: "#F8F6F0", fontFamily: "var(--oj-font-editorial, serif)" }}>
              Clôturer la Journée de Caisse
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.7)", marginBottom: "20px" }}>
              Saisissez le montant d’espèces physiques présent dans le tiroir-caisse pour certifier la concordance avec les écritures.
            </p>

            <form onSubmit={handlePerformClosure}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#D4B483", marginBottom: "6px" }}>
                  MONTANT PHYSIQUE EN CAISSE (FCFA)
                </label>
                <input
                  type="text"
                  placeholder={(Math.max(0, totalEncaisse) / 100).toLocaleString("fr-FR")}
                  value={physicalCashFcfa}
                  onChange={(e) => setPhysicalCashFcfa(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#D4B483", marginBottom: "6px" }}>
                  RESPONSABLE DE CAISSE
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(false)}
                  className="seller-secondary-btn"
                  style={{ padding: "10px 18px", fontSize: "13px" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={closeSubmitting}
                  className="seller-action-btn"
                  style={{ padding: "10px 22px", fontSize: "13px" }}
                >
                  {closeSubmitting ? "Certification..." : "Certifier la Clôture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
