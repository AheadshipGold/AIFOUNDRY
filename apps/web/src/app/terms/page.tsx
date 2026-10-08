import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d’Utilisation & de Vente — Ojarket",
  description: "Conditions d’utilisation, charte marchande et cadre juridique de la plateforme Ojarket · Marketplace de Luxe & Merchant OS.",
};

export default function TermsPage() {
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
          Conditions Générales d’Utilisation & de Vente (CGU / CGV)
        </h1>
        <p style={{ color: "#AD8455", fontSize: "15px", fontWeight: 500, marginBottom: "36px", borderBottom: "1px solid #1E2D28", paddingBottom: "20px" }}>
          Plateforme Ojarket · Marketplace de Prestige & Merchant Commerce OS
        </p>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>1. Préambule & Champ d’Application</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            La plateforme <strong>Ojarket</strong> est un écosystème technologique d’intermédiation commerciale de prestige, de création sur-mesure d’artisanat d’art et un système d’exploitation marchand (<em>Merchant Commerce OS</em>), opérant en Afrique de l’Ouest (Cotonou, Abidjan, Bamako, Dakar) et à l’international.
          </p>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Les présentes Conditions Générales régissent l’accès, la navigation et l’ensemble des transactions effectuées entre Acheteurs, Vendeurs/Artisans et la Boutique Officielle Kingston Bio sur le site <code>ojarket.com</code> ainsi que sur l’application mobile Ojarket.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>2. Certification Marchande & Boutiques Vérifiées (KYC)</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Ojarket applique une politique rigoureuse d’admission des ateliers et créateurs. Toute boutique référencée fait l’objet d’un audit préalable de conformité (pièce d’identité, registre de commerce, preuve d’atelier de fabrication).
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}><strong>Boutique Officielle :</strong> Kingston Bio est l’entité officielle garantissant la sélection permanente des créations phares et le maintien des standards de haute facture.</li>
            <li style={{ marginBottom: "8px" }}><strong>Norme Anti-Contrefaçon :</strong> Toute contrefaçon, reproduction non autorisée ou produit dégradant le prestige de la plateforme entraîne la suspension immédiate du compte marchand et la retenue conservatoire des avoirs.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>3. Commandes sur-mesure (Parcours D02) & Devis Chiffrés</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Ojarket propose un service de création sur-mesure permettant aux acheteurs de soumettre un cahier des charges (description, matières nobles, dimensions, budget estimé).
          </p>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Tout devis émis par un artisan et accepté par l’acheteur constitue un engagement contractuel irrévocable. En raison du caractère personnalisé et artisanal des créations sur-mesure, le droit de rétractation standard ne s’applique pas une fois la fabrication entamée avec l’accord formel de l’acheteur.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>4. Transactions Financières & Règle FinOps</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Les règlements s’effectuent en Francs CFA (XOF) ou en devises internationales converties via les corridors officiels agréés (MTN MoMo, Moov Money, Celtiis Cash, Carte Bancaire et Virement Sécurisé).
          </p>
          <div style={{ backgroundColor: "#09211C", borderLeft: "4px solid #10B981", padding: "16px 20px", borderRadius: "4px", marginTop: "12px" }}>
            <p style={{ margin: 0, color: "#E2E8F0", fontSize: "14px" }}>
              <strong>Principe FinOps d’Inviolabilité :</strong> Conformément à la règle <em>Vendu ≠ Encaissé</em> de la plateforme, toute commande est séquestrée et sécurisée jusqu’à validation de la délivrance conforme au client. Aucun transfert de fonds n’est exécuté sans traçabilité complète dans le registre immuable d’audit SHA-256.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>5. Avis Clients & Règle d’Or d’Achat Vérifié</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Afin de garantir une authenticité totale et d’éradiquer les faux avis :
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>Seuls les acheteurs ayant passé et réglé une commande confirmée ont le droit de déposer une note et un commentaire sur une création.</li>
            <li style={{ marginBottom: "8px" }}>Les créations récentes sans transaction préalable n’affichent aucune fausse note et portent exclusivement la mention noble <strong>NOUVEAU / NEW ARRIVAL</strong>.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>6. Litiges, Juridiction & Droit Applicable</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Les présentes conditions sont régies par les lois commerciales en vigueur en République du Bénin et les actes uniformes de l’OHADA relatifs au droit commercial et à l’économie numérique. En cas de différend non résolu à l’amiable via le service de médiation Ojarket, compétence expresse est attribuée aux tribunaux compétents de Cotonou.
          </p>
        </section>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1E2D28", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#8A9994" }}>
            Support juridique : <strong>services@ojarket.com</strong>
          </span>
          <Link href="/privacy" style={{ color: "#D4B483", fontSize: "14px", textDecoration: "underline" }}>
            Voir la Politique de Confidentialité →
          </Link>
        </div>
      </div>
    </div>
  );
}
