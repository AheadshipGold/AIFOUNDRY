import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialite et Protection des Donnees - Ojarket",
  description: "Protection des donnees personnelles, conformite RGPD, APDP Benin et securite des transactions sur Ojarket.",
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
            Retour a l accueil
          </Link>
          <span style={{ fontSize: "12px", color: "#8A9994", textTransform: "uppercase", letterSpacing: "1px" }}>
            Derniere mise a jour : Octobre 2026
          </span>
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#F8F6F0", marginBottom: "8px" }}>
          Politique de Confidentialite et Protection des Donnees
        </h1>
        <p style={{ color: "#AD8455", fontSize: "15px", fontWeight: 500, marginBottom: "36px", borderBottom: "1px solid #1E2D28", paddingBottom: "20px" }}>
          Engagements d Integrite Numerique et Respect de la Vie Privee - Ojarket
        </p>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>1. Engagement General et Cadre Reglementaire</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            La preservation de la confidentialite de vos informations est un pilier fondateur de l excellence d Ojarket. Nous nous conformons rigoureusement au Livre V du Code du Numerique en Republique du Benin regissant la protection des donnees personnelles (APDP), ainsi qu aux standards internationaux de securite et de confidentialite (RGPD).
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>2. Donnees Collectees</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Nous collectons uniquement les donnees strictement necessaires au fonctionnement optimal de nos services d exception :
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}><strong>Identite et Authentification :</strong> Nom, prenom, adresse e-mail, numero de telephone securise via Better Auth et chiffrement HMAC-SHA256.</li>
            <li style={{ marginBottom: "8px" }}><strong>Verification Marchande (KYC) :</strong> Documents legaux d identification des artisans pour certifier l authenticite de la chaine d approvisionnement de luxe.</li>
            <li style={{ marginBottom: "8px" }}><strong>Transactions et Commandes :</strong> Historique chiffre des reglements, adresses de livraison des pieces artisanales et devis sur-mesure (Parcours D02).</li>
            <li style={{ marginBottom: "8px" }}><strong>Metadonnees d Audit FinOps :</strong> Horodatages immuables pour garantir l equilibre des livres de caisse et la prevention absolue de la fraude.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>3. Utilisation et Finalite des Donnees</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Vos donnees ne sont ni vendues, ni louees, ni cedees a des courtiers tiers. Elles sont exclusivement utilisees pour :
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>La livraison securisee des creations physiques et l acces aux droits de telechargement des creations numeriques.</li>
            <li style={{ marginBottom: "8px" }}>La mise en relation acheteur-createur pour les projets de confection sur-mesure.</li>
            <li style={{ marginBottom: "8px" }}>La certification des avis d achats verifies pour maintenir l integrite du catalogue.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>4. Securite de l Infrastructure et Cryptographie</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Toutes les connexions sont protegees par le chiffrement TLS 1.3 de bout en bout via Cloudflare. La base de donnees PostgreSQL Serverless (hebergee sur Neon) applique une isolation etanche des donnees marchandes. Vos sessions sont signees par des cles cryptographiques privees inaccessibles au public.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>5. Vos Droits (Acces, Rectification, Suppression)</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Conformement aux reglementations sur la protection des donnees personnelles, vous disposez d un droit permanent d acces, de rectification, de portabilite et de suppression de vos donnees.
          </p>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Pour exercer vos droits ou demander la suppression definitive de votre compte, adressez un message a notre Delegue a la Protection des Donnees (DPO) : <strong>privacy@ojarket.com</strong>.
          </p>
        </section>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1E2D28", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#8A9994" }}>
            Contact DPO : <strong>privacy@ojarket.com</strong>
          </span>
          <Link href="/terms" style={{ color: "#D4B483", fontSize: "14px", textDecoration: "underline" }}>
            Consulter les Conditions Generales (CGU / CGV)
          </Link>
        </div>
      </div>
    </div>
  );
}
