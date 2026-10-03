"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../landing.css";

interface ProposalItem {
  id: string;
  shopName: string;
  priceMinor: number;
  currency: string;
  productionDays: number;
  notes: string;
  createdAt: string;
}

interface RequestItem {
  id: string;
  title: string;
  description: string;
  category: string;
  targetBudgetMinor: number;
  currency: string;
  status: string;
  proposals: ProposalItem[];
  createdAt: string;
}

export default function StandaloneBespokePage() {
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: "req-01",
      title: "Parure de haute joaillerie en bronze ciselé",
      description: "Recherche d'un atelier d'artisan joaillier capable de forger un collier plastron et manchettes assorties sous 15 jours en bronze noble poli.",
      category: "joaillerie",
      targetBudgetMinor: 28000000,
      currency: "XOF",
      status: "MATCHED",
      proposals: [
        {
          id: "prop-01",
          shopName: "Fonderie Royale d'Abomey",
          priceMinor: 27500000,
          currency: "XOF",
          productionDays: 12,
          notes: "Faisable sous 12 jours. Ébauche envoyée par WhatsApp après confirmation du versement direct MoMo.",
          createdAt: "Il y a 3h",
        },
      ],
      createdAt: "Hier à 16:30",
    },
  ]);

  const [promptInput, setPromptInput] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [budgetFcfa, setBudgetFcfa] = useState("");
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [aiStructuredPreview, setAiStructuredPreview] = useState<any>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/v1/requests")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setRequests(data);
      })
      .catch(() => {});
  }, []);

  const handleAiStructuring = () => {
    if (!promptInput.trim()) return;
    setIsAiStructuring(true);
    setTimeout(() => {
      const isJewelry = /bijou|collier|bague|bronze|or/i.test(promptInput);
      const isFurniture = /table|meuble|console|bois|iroko/i.test(promptInput);
      const cat = isJewelry ? "Joaillerie Royale" : isFurniture ? "Mobilier d'Art" : "Maroquinerie d'Excellence";
      const estBudget = isJewelry ? 320000 : isFurniture ? 650000 : 185000;

      setAiStructuredPreview({
        refinedTitle: `Création Sur-Mesure : ${cat.toUpperCase()}`,
        category: cat,
        materials: ["Matière première locale sélectionnée", "Finitions main d'artisan"],
        estimatedDays: 14,
        priceEstimateFCFA: estBudget,
        targetBoutiques: ["Fonderie Royale d'Abomey", "Maison Ganvié & Fils"],
      });
      if (!budgetFcfa) setBudgetFcfa(estBudget.toString());
      setIsAiStructuring(false);
    }, 600);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseInt(budgetFcfa.replace(/\s+/g, ""), 10) * 100 || 25000000;

    try {
      const res = await fetch("http://localhost:3001/v1/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerPhone,
          rawPrompt: promptInput,
          budgetMinor: budgetNum,
        }),
      });
      if (res.ok) {
        const newReq = await res.json();
        setRequests([newReq, ...requests]);
        setSubmitSuccess(true);
      } else {
        const fallback: RequestItem = {
          id: `req-${Date.now().toString().slice(-4)}`,
          title: promptInput.length > 50 ? `${promptInput.slice(0, 47)}...` : promptInput,
          description: promptInput,
          category: "sur-mesure",
          targetBudgetMinor: budgetNum,
          currency: "XOF",
          status: "OPEN",
          proposals: [],
          createdAt: "À l'instant",
        };
        setRequests([fallback, ...requests]);
        setSubmitSuccess(true);
      }
    } catch {
      const fallback: RequestItem = {
        id: `req-${Date.now().toString().slice(-4)}`,
        title: promptInput.length > 50 ? `${promptInput.slice(0, 47)}...` : promptInput,
        description: promptInput,
        category: "sur-mesure",
        targetBudgetMinor: budgetNum,
        currency: "XOF",
        status: "OPEN",
        proposals: [],
        createdAt: "À l'instant",
      };
      setRequests([fallback, ...requests]);
      setSubmitSuccess(true);
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
              <span className="brand-sub">RÉSEAU SUR-MESURE & ARTISANAT (D02)</span>
            </div>
          </Link>
          <div className="landing-header-actions">
            <Link href="/" className="btn-portal-secondary">
              ← Retour au Marché
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="landing-container" style={{ padding: "48px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 48px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#AD8455", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            MODULE DE MATCHING D02 · COMMANDE SPÉCIALE
          </div>
          <h1 style={{ margin: "12px 0 16px", fontSize: "36px", color: "var(--oj-text-primary)", fontFamily: "Playfair Display, Georgia, serif" }}>
            L&apos;Artisanat d&apos;Excellence Façonné Selon Vos Désirs
          </h1>
          <p style={{ fontSize: "15px", color: "var(--oj-text-secondary)", lineHeight: 1.7 }}>
            Vous ne trouvez pas la création exacte dans notre catalogue ? Déposez votre cahier des charges. Notre moteur
            assiste la structuration technique de votre besoin et le soumet directement aux maîtres ateliers certifiés.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
          {/* Form Card */}
          <div
            style={{
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--oj-border)",
              backgroundColor: "var(--oj-surface)",
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ margin: "0 0 20px", fontSize: "20px", color: "var(--oj-text-primary)" }}>
              Exprimer votre besoin artisanal
            </h3>

            {submitSuccess ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: "44px", marginBottom: "12px" }}>🕊️</div>
                <h4 style={{ fontSize: "18px", color: "#075D49", margin: "0 0 8px" }}>
                  Votre demande a été transmise aux ateliers !
                </h4>
                <p style={{ fontSize: "14px", color: "var(--oj-text-secondary)", lineHeight: 1.6 }}>
                  Les maîtres artisans consultent votre cahier des charges. Leurs propositions chiffrées apparaîtront
                  ci-contre et vous seront notifiées par WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(false);
                    setPromptInput("");
                    setAiStructuredPreview(null);
                  }}
                  className="btn-portal-secondary"
                  style={{ marginTop: "20px" }}
                >
                  Déposer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                    DÉCRIVEZ VOTRE SOUHAIT EN TEXTE LIBRE
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Ex: Je souhaite une malle de voyage en cuir patiné havane avec ferrures dorées gravées à mes initiales 'O.K.', dimensions environ 60x40cm, livrable sous 3 semaines..."
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--oj-border)",
                      backgroundColor: "rgba(0,0,0,0.02)",
                      color: "var(--oj-text-primary)",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAiStructuring}
                    disabled={!promptInput.trim() || isAiStructuring}
                    style={{
                      marginTop: "8px",
                      background: "none",
                      border: "none",
                      color: "#075D49",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    ✨ {isAiStructuring ? "Analyse technique en cours..." : "Structurer avec l'Assistant IA Ojarket"}
                  </button>
                </div>

                {/* AI Structured Preview Card */}
                {aiStructuredPreview && (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid #D4B483",
                      backgroundColor: "rgba(212, 180, 131, 0.08)",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#AD8455", letterSpacing: "0.08em" }}>
                      SPÉCIFICATIONS DÉDUITES PAR L&apos;IA
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--oj-text-primary)", marginTop: "4px" }}>
                      {aiStructuredPreview.refinedTitle}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)", marginTop: "4px" }}>
                      Délai estimé : {aiStructuredPreview.estimatedDays} jours · Ateliers ciblés : {aiStructuredPreview.targetBoutiques.join(", ")}
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                      VOTRE NOM
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Ex: Babatunde Adeleke"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)", color: "var(--oj-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                      TÉLÉPHONE (WHATSAPP)
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)", color: "var(--oj-text-primary)" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                    BUDGET ENVISAGÉ (FCFA)
                  </label>
                  <input
                    type="text"
                    required
                    value={budgetFcfa}
                    onChange={(e) => setBudgetFcfa(e.target.value)}
                    placeholder="Ex: 250000"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)", color: "var(--oj-text-primary)" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-portal-primary"
                  style={{ width: "100%", padding: "14px", fontSize: "15px" }}
                >
                  Diffuser le besoin aux artisans du réseau
                </button>
              </form>
            )}
          </div>

          {/* Active Needs Feed */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "var(--oj-text-primary)" }}>
                Demandes & Offres des Artisans
              </h3>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#075D49", backgroundColor: "rgba(16, 185, 129, 0.12)", padding: "4px 10px", borderRadius: "12px" }}>
                {requests.length} demandes actives
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {requests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: "24px",
                    borderRadius: "14px",
                    border: "1px solid var(--oj-border)",
                    backgroundColor: "var(--oj-surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "#AD8455",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {r.category}
                      </span>
                      <h4 style={{ margin: "4px 0 8px", fontSize: "16px", color: "var(--oj-text-primary)" }}>
                        {r.title}
                      </h4>
                    </div>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: r.status === "MATCHED" ? "rgba(16, 185, 129, 0.15)" : "rgba(212, 180, 131, 0.15)",
                        color: r.status === "MATCHED" ? "#075D49" : "#AD8455",
                      }}
                    >
                      {r.status === "MATCHED" ? "PROPOSITION REÇUE" : "EN RECHERCHE"}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--oj-text-secondary)", lineHeight: 1.6, margin: "8px 0" }}>
                    {r.description}
                  </p>

                  <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)", marginBottom: "14px" }}>
                    Budget cible : <strong>{(r.targetBudgetMinor / 100).toLocaleString("fr-FR")} FCFA</strong> · Déposé {r.createdAt}
                  </div>

                  {/* Proposals List */}
                  {r.proposals && r.proposals.length > 0 && (
                    <div style={{ marginTop: "16px", borderTop: "1px solid var(--oj-border)", paddingTop: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#075D49", letterSpacing: "0.08em", marginBottom: "8px" }}>
                        PROPOSITION D&apos;ATELIER
                      </div>
                      {r.proposals.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(7, 93, 73, 0.05)",
                            border: "1px solid rgba(7, 93, 73, 0.15)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--oj-text-primary)" }}>
                              {p.shopName}
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "#075D49" }}>
                              {(p.priceMinor / 100).toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--oj-text-secondary)", margin: "4px 0" }}>
                            {p.notes} (Délai : {p.productionDays} jours)
                          </div>
                          <button
                            type="button"
                            className="btn-portal-primary"
                            style={{ padding: "8px 16px", fontSize: "12px", marginTop: "8px" }}
                          >
                            Accepter et régler l&apos;acompte direct
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}