import React from "react";
import Link from "next/link";
import { headers } from "next/headers";

export async function generateMetadata() {
  const headersList = await headers();
  const locale = headersList.get("x-ojarket-locale") || "en";
  const isEn = locale === "en";
  
  return {
    title: isEn ? "Terms of Service & Sales - Ojarket" : "Conditions Générales d'Utilisation & de Vente - Ojarket",
    description: isEn ? "Terms of service, seller charter, and legal framework of the Ojarket platform." : "Conditions d'utilisation, charte marchande et cadre juridique de la plateforme Ojarket.",
  };
}

export default async function TermsPage() {
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
          {isEn ? "Terms of Service" : "Conditions Générales d'Utilisation"}
        </h1>
        
        <p style={{ fontSize: "18px", color: "var(--oj-color-muted)", marginBottom: "48px" }}>
          {isEn 
            ? "Welcome to Ojarket. These terms govern your use of our luxury marketplace and Merchant Commerce OS." 
            : "Bienvenue sur Ojarket. Ces conditions régissent votre utilisation de notre marketplace de luxe et de notre système d'exploitation marchand."}
        </p>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", color: "var(--oj-color-accent)", marginBottom: "16px", fontWeight: "400" }}>
            {isEn ? "1. General Provisions" : "1. Dispositions Générales"}
          </h2>
          <p style={{ marginBottom: "16px", color: "var(--oj-color-muted)" }}>
            {isEn
              ? "Ojarket is an exclusive platform connecting discerning buyers with verified luxury sellers. By accessing our platform, you agree to comply with these terms."
              : "Ojarket est une plateforme exclusive mettant en relation des acheteurs exigeants avec des vendeurs de luxe vérifiés. En accédant à notre plateforme, vous acceptez de vous conformer à ces conditions."}
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", color: "var(--oj-color-accent)", marginBottom: "16px", fontWeight: "400" }}>
            {isEn ? "2. Seller Charter (Merchant OS)" : "2. Charte Vendeur (Merchant OS)"}
          </h2>
          <p style={{ marginBottom: "16px", color: "var(--oj-color-muted)" }}>
            {isEn
              ? "Sellers on Ojarket must maintain the highest standards of quality, authenticity, and customer service. All products undergo strict verification."
              : "Les vendeurs sur Ojarket doivent maintenir les plus hauts standards de qualité, d'authenticité et de service client. Tous les produits sont soumis à une vérification stricte."}
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", color: "var(--oj-color-accent)", marginBottom: "16px", fontWeight: "400" }}>
            {isEn ? "3. Financial Operations & Escrow" : "3. Opérations Financières & Séquestre"}
          </h2>
          <p style={{ marginBottom: "16px", color: "var(--oj-color-muted)" }}>
            {isEn
              ? "All transactions are secured. Funds are held in escrow and released to the seller only after the buyer confirms successful receipt of the item."
              : "Toutes les transactions sont sécurisées. Les fonds sont conservés sous séquestre et ne sont débloqués au vendeur qu'après confirmation de la bonne réception par l'acheteur."}
          </p>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid var(--oj-color-border)", margin: "48px 0" }} />

        <div style={{ textAlign: "center", color: "var(--oj-color-muted)", fontSize: "14px" }}>
          <p>{isEn ? "For any legal inquiries, please contact:" : "Pour toute question juridique, veuillez contacter :"}</p>
          <a href="mailto:services@ojarket.com" style={{ color: "var(--oj-color-accent)", textDecoration: "none", fontWeight: "500", marginTop: "8px", display: "inline-block" }}>
            services@ojarket.com
          </a>
        </div>
      </div>
    </div>
  );
}
