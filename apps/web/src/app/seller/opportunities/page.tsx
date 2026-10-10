"use client";

import React, { useState, useEffect } from "react";
import { getStoredToken } from "@/lib/api";
import { sellerTranslations, SellerLocale } from "@/lib/seller-i18n";

interface PurchaseRequest {
  id: string;
  buyerName: string;
  buyerPhone?: string;
  title: string;
  description: string;
  category: string;
  targetBudgetMinor?: number;
  currency: string;
  status: string;
  createdAt: string;
  proposals: Array<{
    id: string;
    shopName: string;
    priceMinor: number;
    advancePaymentRequiredMinor: number;
    productionDays: number;
    notes: string;
    status: string;
  }>;
}

export default function SellerOpportunitiesPage() {
  const [locale, setLocale] = useState<SellerLocale>("fr");
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<PurchaseRequest | null>(null);

  // Proposal Form Modal State
  const [priceFcfa, setPriceFcfa] = useState("");
  const [advanceFcfa, setAdvanceFcfa] = useState("");
  const [productionDays, setProductionDays] = useState("7");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ojarket_seller_locale") as SellerLocale;
      if (saved === "en" || saved === "fr") setLocale(saved);
    } catch {}

    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    const token = getStoredToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch("/api/v1/requests", { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setRequests(data);
        } else {
          setRequests([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setRequests([]);
        setLoading(false);
      });
  };

  const handleOpenQuoteModal = (req: PurchaseRequest) => {
    setSelectedReq(req);
    const defaultBudget = req.targetBudgetMinor ? Math.round(req.targetBudgetMinor / 100).toString() : "";
    setPriceFcfa(defaultBudget);
    setAdvanceFcfa(defaultBudget ? Math.round(Number(defaultBudget) * 0.3).toString() : "");
    setProductionDays("7");
    setNotes("Nous nous engageons à confectionner cette pièce selon les exigences précises de votre demande.");
    setQuoteSuccess(null);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const priceNum = parseInt(priceFcfa.replace(/\D/g, ""), 10);
    const advanceNum = advanceFcfa ? parseInt(advanceFcfa.replace(/\D/g, ""), 10) : 0;

    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Veuillez saisir un prix proposé valide.");
      return;
    }

    setSubmitting(true);
    const token = getStoredToken();

    try {
      const res = await fetch(`/api/v1/requests/${selectedReq.id}/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          priceMinor: priceNum * 100,
          advancePaymentRequiredMinor: advanceNum * 100,
          productionDays: parseInt(productionDays, 10) || 7,
          proposalNotes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur de soumission");
      }

      setQuoteSuccess("Proposition transmise à l'acheteur avec succès !");
      setTimeout(() => {
        setSelectedReq(null);
        fetchRequests();
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Échec de l'envoi de la proposition");
    } finally {
      setSubmitting(false);
    }
  };

  const t = sellerTranslations[locale];

  const formatPrice = (minor: number) => {
    return (minor / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " FCFA";
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "28px", color: "#F8F6F0", margin: "0 0 6px 0" }}>
          {t.nav.opportunities}
        </h1>
        <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", margin: 0 }}>
          Demandes d'achats et créations sur-mesure émises par les clients de la marketplace.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "64px", textAlign: "center", color: "rgba(248, 246, 240, 0.5)" }}>
          Chargement des opportunités d'artisanat...
        </div>
      ) : requests.length === 0 ? (
        <div
          className="seller-card"
          style={{
            padding: "64px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              backgroundColor: "rgba(173, 132, 85, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D4B483",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "20px", color: "#F8F6F0", margin: "0 0 8px 0" }}>
            Aucune demande d'acheteur ouverte
          </h3>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", maxWidth: "460px", margin: "0 auto" }}>
            Dès qu'un client dépose un besoin sur-mesure (maroquinerie sur mesure, bijou personnalisé...), vous pourrez lui soumettre un devis certifié.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="seller-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#D4B483", fontWeight: 600 }}>
                    {req.category}
                  </span>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: req.status === "OPEN" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.1)",
                      color: req.status === "OPEN" ? "#10B981" : "rgba(248, 246, 240, 0.6)",
                    }}
                  >
                    {req.status === "OPEN" ? "Demande Ouverte" : req.status}
                  </span>
                </div>

                <h3 style={{ fontSize: "17px", color: "#F8F6F0", margin: "0 0 10px 0", fontFamily: "var(--oj-font-editorial, serif)" }}>
                  {req.title}
                </h3>

                <p style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.7)", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                  {req.description}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "rgba(248, 246, 240, 0.6)", marginBottom: "8px" }}>
                  <span>Client : {req.buyerName}</span>
                  {req.targetBudgetMinor && (
                    <span style={{ color: "#D4B483", fontWeight: 600 }}>
                      Budget : {formatPrice(req.targetBudgetMinor)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.5)", marginBottom: "16px" }}>
                  {req.proposals?.length || 0} devis artisan(s) déjà soumis
                </div>
              </div>

              <button onClick={() => handleOpenQuoteModal(req)} className="seller-action-btn" style={{ width: "100%", padding: "10px", fontSize: "13px", justifyContent: "center" }}
              >
                Préparer un devis artisan →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quote Preparation Modal */}
      {selectedReq && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="seller-card"
            style={{
              maxWidth: "540px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "20px", color: "#D4B483", margin: "0 0 4px 0" }}>
                  Devis Artisanal Sur-Mesure
                </h3>
                <div style={{ fontSize: "13px", color: "rgba(248, 246, 240, 0.8)" }}>
                  Pour : {selectedReq.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                style={{ background: "none", border: "none", color: "rgba(248, 246, 240, 0.6)", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {quoteSuccess ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#10B981", fontSize: "15px", fontWeight: 600 }}>
                {quoteSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "#F8F6F0", marginBottom: "6px" }}>
                      Montant total (FCFA) *
                    </label>
                    <input
                      type="text"
                      required
                      value={priceFcfa}
                      onChange={(e) => setPriceFcfa(e.target.value)}
                      placeholder="Ex: 250000"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#F8F6F0",
                        fontSize: "13.5px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", color: "#F8F6F0", marginBottom: "6px" }}>
                      Acompte requis (FCFA)
                    </label>
                    <input
                      type="text"
                      value={advanceFcfa}
                      onChange={(e) => setAdvanceFcfa(e.target.value)}
                      placeholder="Ex: 75000"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#F8F6F0",
                        fontSize: "13.5px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "#F8F6F0", marginBottom: "6px" }}>
                    Délai de confection (en jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productionDays}
                    onChange={(e) => setProductionDays(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#F8F6F0",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "#F8F6F0", marginBottom: "6px" }}>
                    Notes et spécifications d'engagement
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#F8F6F0",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <button type="button" onClick={() => setSelectedReq(null)} className="seller-secondary-btn" style={{ padding: "10px 16px", fontSize: "13px" }}
                  >
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting} className="seller-action-btn" style={{ padding: "10px 22px", fontSize: "13px", cursor: submitting ? "wait" : "pointer" }}
                  >
                    {submitting ? "Transmission..." : "Envoyer le devis certifié"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
