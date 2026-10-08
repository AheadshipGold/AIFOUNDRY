import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité & Protection des Données — Ojarket",
  description: "Protection des données personnelles, conformité RGPD, APDP Bénin et sécurité des transactions sur Ojarket.",
};

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0A1210",
      color: "#F8F6F0",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
      padding: "40px 20px 80px",
      lineHeight: "1.7",
    }}>
      <div style={{
        maxWidth: "920px",
        margin: "0 auto",
        backgroundColor: "#0F1A17",
        border: "1px solid #1E2D28",
        borderRadius: "16px",
        padding: "48px 40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
      }}>
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/" style={{
            color: "#D4B483",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
            ← Retour à l’accueil
          </Link>
          <span style={{ fontSize: "12px", color: "#8A9994", textTransform: "uppercase", letterSpacing: "1px" }}>
            Dernière mise à jour : Octobre 2026
          </span>
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#F8F6F0", marginBottom: "8px" }}>
          Politique de Confidentialité & Protection des Données
        </h1>
        <p style={{ color: "#AD8455", fontSize: "15px", fontWeight: 500, marginBottom: "36px", borderBottom: "1px solid #1E2D28", paddingBottom: "20px" }}>
          Engagements d’Intégrité Numérique & Respect de la Vie Privée · Ojarket
        </p>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>1. Engagement Général & Cadre Réglementaire</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            La préservation de la confidentialité de vos informations est un pilier fondateur de l’excellence d’Ojarket. Nous nous conformons rigoureusement au Livre V du Code du Numérique en République du Bénin régissant la protection des données personnelles (APDP), ainsi qu’aux standards internationaux de sécurité et de confidentialité (RGPD).
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>2. Données Collectées</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Nous collectons uniquement les données strictement nécessaires au fonctionnement optimal de nos services d’exception :
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}><strong>Identité & Authentification :</strong> Nom, prénom, adresse e-mail, numéro de téléphone sécurisé via Better Auth et chiffrement HMAC-SHA256.</li>
            <li style={{ marginBottom: "8px" }}><strong>Vérification Marchande (KYC) :</strong> Documents légaux d’identification des artisans pour certifier l’authenticité de la chaîne d’approvisionnement de luxe.</li>
            <li style={{ marginBottom: "8px" }}><strong>Transactions & Commandes :</strong> Historique chiffré des règlements, adresses de livraison des pièces artisanales et devis sur-mesure (Parcours D02).</li>
            <li style={{ marginBottom: "8px" }}><strong>Métadonnées d’Audit FinOps :</strong> Horodatages immuables pour garantir l’équilibre des livres de caisse et la prévention absolue de la fraude.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>3. Utilisation & Finalité des Données</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Vos données ne sont ni vendues, ni louées, ni cédées à des tiers. Elles sont exclusivement utilisées pour :
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>La livraison sécurisée des créations physiques et l’accès aux droits de téléchargement des créations numériques.</li>
            <li style={{ marginBottom: "8px" }}>La mise en relation acheteur-créateur pour les projets de confection sur-mesure.</li>
            <li style={{ marginBottom: "8px" }}>La certification des avis d’achats vérifiés pour maintenir l’intégrité du catalogue.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>4. Sécurité de l’Infrastructure & Cryptographie</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Toutes les connexions sont protégées par le chiffrement TLS 1.3 de bout en bout via Cloudflare. La base de données PostgreSQL Serverless (hébergée sur Neon) applique une isolation étanche des données marchandes. Vos sessions sont signées par des clés cryptographiques privées inaccessibles au public.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>5. Vos Droits (Accès, Rectification, Suppression)</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Conformément aux réglementations sur la protection des données personnelles, vous disposez d’un droit permanent d’accès, de rectification, de portabilité et de suppression de vos données.
          </p>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Pour exercer vos droits ou demander la suppression définitive de votre compte, adressez un message à notre Délégué à la Protection des Données (DPO) : <strong>services@ojarket.com</strong>.
          </p>
        </section>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1E2D28", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#8A9994" }}>
            Contact DPO : <strong>services@ojarket.com</strong>
          </span>
          <Link href="/terms" style={{ color: "#D4B483", fontSize: "14px", textDecoration: "underline" }}>
            Consulter les Conditions Générales (CGU / CGV) →
          </Link>
        </div>
      </div>
    </div>
  );
}
