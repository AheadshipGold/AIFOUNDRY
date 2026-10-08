import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Conditions Generales d Utilisation et de Vente - Ojarket",
  description: "Conditions d utilisation et cadre juridique de la plateforme Ojarket Marketplace de Luxe.",
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
            Retour a l accueil
          </Link>
          <span style={{ fontSize: "12px", color: "#8A9994", textTransform: "uppercase", letterSpacing: "1px" }}>
            Derniere mise a jour : Octobre 2026
          </span>
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#F8F6F0", marginBottom: "8px" }}>
          Conditions Generales d Utilisation et de Vente (CGU / CGV)
        </h1>
        <p style={{ color: "#AD8455", fontSize: "15px", fontWeight: 500, marginBottom: "36px", borderBottom: "1px solid #1E2D28", paddingBottom: "20px" }}>
          Plateforme Ojarket - Marketplace de Prestige et Merchant Commerce OS
        </p>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>1. Preambule et Champ d Application</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            La plateforme <strong>Ojarket</strong> est un ecosysteme technologique d intermediation commerciale de prestige, de creation sur-mesure d artisanat d art et un systeme d exploitation marchand (Merchant Commerce OS), operant en Afrique de l Ouest (Cotonou, Abidjan, Bamako, Dakar) et a l international.
          </p>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Les presentes Conditions Generales regissent l acces, la navigation et l ensemble des transactions effectuees entre Acheteurs, Vendeurs/Artisans et la Boutique Officielle Kingston Bio sur le site ojarket.com ainsi que sur l application mobile Ojarket.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>2. Certification Marchande et Boutiques Verifiees (KYC)</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Ojarket applique une politique rigoureuse d admission des ateliers et createurs. Toute boutique referencee fait l objet d un audit prealable de conformite (piece d identite, registre de commerce, preuve d atelier de fabrication).
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}><strong>Boutique Officielle :</strong> Kingston Bio est l entite officielle garantissant la selection permanente des creations phares et le maintien des standards de haute facture.</li>
            <li style={{ marginBottom: "8px" }}><strong>Norme Anti-Contrefacon :</strong> Toute contrefacon, reproduction non autorisee ou produit degradant le prestige de la plateforme entraine la suspension immediate du compte marchand et la retenue conservatoire des avoirs.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>3. Commandes sur-mesure (Parcours D02) et Devis Chiffres</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Ojarket propose un service de creation sur-mesure permettant aux acheteurs de soumettre un cahier des charges (description, matieres nobles, dimensions, budget estime).
          </p>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Tout devis emis par un artisan et accepte par l acheteur constitue un engagement contractuel irrevocable. En raison du caractere personnalise et artisanal des creations sur-mesure, le droit de retractation standard ne s applique pas une fois la fabrication entamee avec l accord formel de l acheteur.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>4. Transactions Financieres et Regle FinOps</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Les reglements s effectuent en Francs CFA (XOF) ou en devises internationales converties via les corridors officiels agrees (MTN MoMo, Moov Money, Celtiis Cash, Carte Bancaire et Virement Securise).
          </p>
          <div style={{ backgroundColor: "#09211C", borderLeft: "4px solid #10B981", padding: "16px 20px", borderRadius: "4px", marginTop: "12px" }}>
            <p style={{ margin: 0, color: "#E2E8F0", fontSize: "14px" }}>
              <strong>Principe FinOps d Inviolabilite :</strong> Conformement a la regle Vendu different de Encaisse de la plateforme, toute commande est sequestree et securisee jusqu a validation de la delivrance conforme au client. Aucun transfert de fonds n est execute sans tracabilite complete dans le registre immuable d audit SHA-256.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>5. Avis Clients et Regle d Or d Achat Verifie</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Afin de garantir une authenticite totale et d eradiquer les faux avis :
          </p>
          <ul style={{ color: "#C5D1CD", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>Seuls les acheteurs ayant passe et regle une commande confirmee ont le droit de deposer une note et un commentaire sur une creation.</li>
            <li style={{ marginBottom: "8px" }}>Les creations recentes sans transaction prealable n affichent aucune fausse note et portent exclusivement la mention noble <strong>NOUVEAU / NEW ARRIVAL</strong>.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#D4B483", fontSize: "19px", marginBottom: "12px" }}>6. Litiges, Juridiction et Droit Applicable</h2>
          <p style={{ color: "#C5D1CD", fontSize: "15px" }}>
            Les presentes conditions sont regies par les lois commerciales en vigueur en Republique du Benin et les actes uniformes de l OHADA relatifs au droit commercial et a l economie numerique. En cas de differend non resolu a l amiable via le service de mediation Ojarket, competence expresse est attribuee aux tribunaux competents de Cotonou.
          </p>
        </section>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1E2D28", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#8A9994" }}>
            Support juridique : <strong>legal@ojarket.com</strong>
          </span>
          <Link href="/privacy" style={{ color: "#D4B483", fontSize: "14px", textDecoration: "underline" }}>
            Voir la Politique de Confidentialite
          </Link>
        </div>
      </div>
    </div>
  );
}
