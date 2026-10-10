import React from "react";
import Link from "next/link";
import { headers } from "next/headers";

export async function generateMetadata() {
  const headersList = await headers();
  const locale = headersList.get("x-ojarket-locale") || "en";
  const isEn = locale === "en";
  
  return {
    title: isEn ? "Privacy Policy - Ojarket" : "Politique de Confidentialité - Ojarket",
    description: isEn ? "Privacy policy and data protection for the Ojarket platform." : "Politique de confidentialité et protection des données de la plateforme Ojarket.",
  };
}

export default async function PrivacyPage() {
  const headersList = await headers();
  const locale = headersList.get("x-ojarket-locale") || "en";
  const isEn = locale === "en";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--oj-color-bg)",
      color: "var(--oj-color-fg)",
      fontFamily: "var(--oj-font-sans)",
      padding: "40px 20px 80px",
      lineHeight: "1.7",
    }}>
      <div style={{
        maxWidth: "920px",
        margin: "0 auto",
        backgroundColor: "var(--oj-color-surface)",
        border: "1px solid var(--oj-color-border)",
        borderRadius: "16px",
        padding: "48px 40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
      }}>
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/" style={{
            color: "var(--oj-color-accent)",
            textDecoration: "none",
            fontWeight: "600",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontSize: "14px"
          }}>
            ← {isEn ? "Return to Homepage" : "Retour à l'Accueil"}
          </Link>
          <span style={{ color: "var(--oj-color-muted)", fontSize: "14px", fontFamily: "var(--oj-font-editorial)", fontStyle: "italic" }}>
            {isEn ? "Last updated: October 2026" : "Dernière mise à jour : Octobre 2026"}
          </span>
        </div>

        <h1 style={{
          fontFamily: "var(--oj-font-editorial)",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: "400",
          color: "var(--oj-color-fg)",
          marginBottom: "16px",
          lineHeight: "1.2",
          letterSpacing: "-0.5px"
        }}>
          {isEn ? "Privacy Policy" : "Politique de Confidentialité"}
        </h1>
        
        <p style={{ fontSize: "18px", color: "var(--oj-color-muted)", marginBottom: "48px" }}>
          {isEn 
            ? "Your privacy and data security are our highest priority." 
            : "Votre vie privée et la sécurité de vos données sont notre priorité absolue."}
        </p>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", color: "var(--oj-color-accent)", marginBottom: "16px", fontWeight: "400" }}>
            {isEn ? "1. Data Collection" : "1. Collecte des Données"}
          </h2>
          <p style={{ marginBottom: "16px", color: "var(--oj-color-muted)" }}>
            {isEn
              ? "We collect only the essential information required to process your orders, secure your transactions, and deliver a personalized luxury experience."
              : "Nous ne collectons que les informations essentielles requises pour traiter vos commandes, sécuriser vos transactions et offrir une expérience de luxe personnalisée."}
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", color: "var(--oj-color-accent)", marginBottom: "16px", fontWeight: "400" }}>
            {isEn ? "2. Data Protection" : "2. Protection des Données"}
          </h2>
          <p style={{ marginBottom: "16px", color: "var(--oj-color-muted)" }}>
            {isEn
              ? "Your data is encrypted using industry-standard protocols. We never sell your personal information to third parties."
              : "Vos données sont chiffrées selon les protocoles standards de l'industrie. Nous ne vendons jamais vos informations personnelles à des tiers."}
          </p>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid var(--oj-color-border)", margin: "48px 0" }} />

        <div style={{ textAlign: "center", color: "var(--oj-color-muted)", fontSize: "14px" }}>
          <p>{isEn ? "For any privacy-related inquiries, please contact:" : "Pour toute question relative à la confidentialité, veuillez contacter :"}</p>
          <a href="mailto:services@ojarket.com" style={{ color: "var(--oj-color-accent)", textDecoration: "none", fontWeight: "500", marginTop: "8px", display: "inline-block" }}>
            services@ojarket.com
          </a>
        </div>
      </div>
    </div>
  );
}
