"use client";
import { useState } from "react";
import { useDesign } from "../design-system/provider";
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  OrderStatusBadge,
  PaymentStatusBadge,
  Price,
  SearchField,
  Select,
  TextField,
} from "../design-system/components";
import { referenceOrders } from "./fixtures";

export type ExtendedScreen = "requests" | "compare" | "orders" | "cashbook";
const fr = {
  requests: "Exprimer un besoin",
  compare: "Comparer",
  orders: "Commandes",
  cashbook: "Caisse & journal",
  lead: "Décrivez ce que vous cherchez. Les vendeurs pourront vous proposer une réponse précise.",
  description: "Votre besoin",
  descriptionHint:
    "Quantité, format, matière, usage : précisez ce qui compte pour vous.",
  quantity: "Quantité",
  budget: "Budget indicatif, XOF (facultatif)",
  place: "Lieu",
  consent: "J’accepte de partager ces critères avec les vendeurs concernés.",
  review: "Vérifier la demande",
  preview: "Aperçu de la demande",
  notPublished:
    "Démonstration : cette demande n’est pas publiée. Aucun vendeur ne sera contacté.",
  required: "Décrivez votre besoin et autorisez le partage pour continuer.",
  unknown: "Non renseigné",
  cancel: "Retour",
  compareExamples: "Voir les propositions exemples",
  compareTitle: "Comparez les conditions, pas seulement le prix.",
  compareLead:
    "Exemple indépendant : 12 carnets A5, Cotonou. Aucune proposition réelle ni classement automatique.",
  offer: "Proposition",
  price: "Prix des articles",
  fees: "Livraison",
  total: "Total connu",
  time: "Délai annoncé",
  availability: "Disponibilité",
  validity: "Validité",
  terms: "Conditions",
  choose: "Examiner cette proposition",
  confirm: "Aucun accord réel n’est conclu dans cette démonstration.",
  toConfirm: "À confirmer",
  pickup: "Retrait sans frais",
  days: "2 jours après accord",
  stock: "Déclarée par vendeur",
  until: "30 septembre 2026, 18 h · exemple",
  partial: "8 sur 12 unités",
  complete: "12 sur 12 unités",
  ordersTitle: "Chaque commande, sa prochaine étape.",
  ordersLead:
    "Paiement et exécution restent distincts. Liste partielle de démonstration.",
  filter: "Filtrer les paiements",
  all: "Tous",
  declared: "Déclaré par acheteur",
  confirmed: "Confirmés",
  search: "Rechercher une référence",
  view: "Ouvrir",
  agreement: "Accord",
  payment: "Paiement",
  execution: "Exécution",
  orderInfo:
    "Exemple de commande, conditions version 1. Aucun statut ne sera modifié ici.",
  empty: "Aucun élément pour ces filtres.",
  clear: "Réinitialiser",
  cashTitle: "Ce qui est entré. Ce qui reste à vérifier.",
  cashLead: "Journal de démonstration · 29 septembre 2026 · XOF",
  receipts: "Encaissements confirmés",
  pending: "Déclarations non encaissées",
  source: "Source",
  manual: "Vendeur",
  provider: "Prestataire",
  entry: "Entrée",
  actor: "Acteur",
  immutable:
    "Les corrections créent un ajustement audité. Une entrée confirmée n’est jamais effacée silencieusement.",
};
const en: Record<keyof typeof fr, string> = {
  requests: "Post a request",
  compare: "Compare",
  orders: "Orders",
  cashbook: "Cashbook",
  lead: "Describe what you need. Sellers can respond with a precise proposal.",
  description: "Your request",
  descriptionHint: "Quantity, format, material, use: describe what matters.",
  quantity: "Quantity",
  budget: "Indicative budget, XOF (optional)",
  place: "Location",
  consent: "I agree to share these criteria with relevant sellers.",
  review: "Review request",
  preview: "Request preview",
  notPublished:
    "Demo: this request is not published. No seller will be contacted.",
  required: "Describe your request and allow sharing to continue.",
  unknown: "Not provided",
  cancel: "Back",
  compareExamples: "View example proposals",
  compareTitle: "Compare terms, not just prices.",
  compareLead:
    "Independent example: 12 A5 notebooks, Cotonou. No real proposals or automated ranking.",
  offer: "Proposal",
  price: "Item price",
  fees: "Delivery",
  total: "Known total",
  time: "Declared timing",
  availability: "Availability",
  validity: "Validity",
  terms: "Terms",
  choose: "Review this proposal",
  confirm: "No real agreement is made in this demo.",
  toConfirm: "To confirm",
  pickup: "Free pickup",
  days: "2 days after agreement",
  stock: "Declared by seller",
  until: "30 September 2026, 18:00 · example",
  partial: "8 of 12 units",
  complete: "12 of 12 units",
  ordersTitle: "Every order, its next step.",
  ordersLead:
    "Payment and fulfillment remain separate. Partial demonstration list.",
  filter: "Filter payments",
  all: "All",
  declared: "Declared by buyer",
  confirmed: "Confirmed",
  search: "Find a reference",
  view: "Open",
  agreement: "Agreement",
  payment: "Payment",
  execution: "Fulfillment",
  orderInfo: "Sample order, terms version 1. No status will be changed here.",
  empty: "No items match these filters.",
  clear: "Reset",
  cashTitle: "What came in. What needs review.",
  cashLead: "Demonstration journal · 29 September 2026 · XOF",
  receipts: "Confirmed receipts",
  pending: "Declarations not received",
  source: "Source",
  manual: "Seller",
  provider: "Provider",
  entry: "Money in",
  actor: "Actor",
  immutable:
    "Corrections create an audited adjustment. Confirmed entries are never silently erased.",
};
export const extendedMessages = { fr, en };

export function RequestView({
  onCompare,
  disabled,
}: {
  onCompare: () => void;
  disabled: boolean;
}) {
  const { locale } = useDesign();
  const c = extendedMessages[locale];
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("12");
  const [budget, setBudget] = useState("");
  const [place, setPlace] = useState("Cotonou");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState(false);
  return (
    <div className="ref-request-layout">
      <div>
        <p className="ref-kicker">D02 · {c.requests}</p>
        <h1>{c.requests}</h1>
        <p className="ref-lead">{c.lead}</p>
        <form
          className="ref-request-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!description.trim() || !consent) {
              setError(true);
              return;
            }
            setError(false);
            setPreview(true);
          }}
        >
          <div className="ds-field">
            <label htmlFor="request-description">{c.description}</label>
            <textarea
              id="request-description"
              className="ds-input"
              rows={5}
              maxLength={1200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-describedby="request-help"
              required
            />
            <span className="ref-muted" id="request-help">
              {c.descriptionHint}
            </span>
          </div>
          <div className="ref-form-pair">
            <TextField
              label={c.quantity}
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <TextField
              label={c.budget}
              type="number"
              min="0"
              step="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <TextField
            label={c.place}
            value={place}
            required
            onChange={(e) => setPlace(e.target.value)}
          />
          <Checkbox
            label={c.consent}
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          {error && (
            <p role="alert" className="ds-error">
              {c.required}
            </p>
          )}
          <Button type="submit" disabled={disabled}>
            {c.review}
          </Button>
        </form>
      </div>
      <aside className="ref-request-aside">
        <h2>{c.compare}</h2>
        <p>{c.compareLead}</p>
        <Button variant="secondary" onClick={onCompare}>
          {c.compareExamples}
        </Button>
      </aside>
      <Dialog
        open={preview}
        title={c.preview}
        onClose={() => setPreview(false)}
      >
        <p>{description}</p>
        <dl className="ref-definition">
          <dt>{c.quantity}</dt>
          <dd>{quantity}</dd>
          <dt>{c.budget}</dt>
          <dd>
            {budget ? (
              <Price amountMinor={Number(budget)} currency="XOF" />
            ) : (
              c.unknown
            )}
          </dd>
          <dt>{c.place}</dt>
          <dd>{place}</dd>
        </dl>
        <p className="ref-muted">{c.notPublished}</p>
        <Button variant="secondary" onClick={() => setPreview(false)}>
          {c.cancel}
        </Button>
      </Dialog>
    </div>
  );
}
export function CompareView({ disabled }: { disabled: boolean }) {
  const { locale } = useDesign();
  const c = extendedMessages[locale];
  const [selected, setSelected] = useState<string | null>(null);
  const proposals = [
    {
      id: "PROP-A",
      shop: "Papeterie A",
      amount: 48000,
      fee: 2000,
      partial: false,
    },
    {
      id: "PROP-B",
      shop: "Papeterie B",
      amount: 45000,
      fee: null,
      partial: false,
    },
    { id: "PROP-C", shop: "Papeterie C", amount: 32000, fee: 0, partial: true },
  ];
  return (
    <>
      <p className="ref-kicker">D02 · {c.compare}</p>
      <h1>{c.compareTitle}</h1>
      <p className="ref-lead">{c.compareLead}</p>
      <div className="ref-comparison">
        {proposals.map((p) => (
          <article key={p.id}>
            <p className="ref-kicker">{p.id}</p>
            <h2>{p.shop}</h2>
            <Badge tone={p.partial ? "pending" : "neutral"}>
              {p.partial ? c.partial : c.complete}
            </Badge>
            <dl className="ref-definition">
              <dt>{c.price}</dt>
              <dd>
                <Price amountMinor={p.amount} currency="XOF" />
              </dd>
              <dt>{c.fees}</dt>
              <dd>
                {p.fee === null ? (
                  c.toConfirm
                ) : p.fee === 0 ? (
                  c.pickup
                ) : (
                  <Price amountMinor={p.fee} currency="XOF" />
                )}
              </dd>
              <dt>{c.total}</dt>
              <dd>
                {p.fee === null ? (
                  c.toConfirm
                ) : (
                  <Price amountMinor={p.amount + p.fee} currency="XOF" />
                )}
              </dd>
              <dt>{c.time}</dt>
              <dd>{c.days}</dd>
              <dt>{c.availability}</dt>
              <dd>{c.stock}</dd>
              <dt>{c.validity}</dt>
              <dd>{c.until}</dd>
            </dl>
            <Button
              variant="secondary"
              disabled={disabled}
              onClick={() => setSelected(p.id)}
            >
              {c.choose}
            </Button>
          </article>
        ))}
      </div>
      <Dialog
        open={selected !== null}
        title={`${c.offer} ${selected ?? ""}`}
        onClose={() => setSelected(null)}
      >
        <p>{c.confirm}</p>
        <p className="ref-muted">{c.compareLead}</p>
        <Button variant="secondary" onClick={() => setSelected(null)}>
          {c.cancel}
        </Button>
      </Dialog>
    </>
  );
}
export function OrdersView() {
  const { locale } = useDesign();
  const c = extendedMessages[locale];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<
    (typeof referenceOrders)[number] | null
  >(null);
  const rows = referenceOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || o.status === filter),
  );
  return (
    <>
      <p className="ref-kicker">Boutique Naya · {c.orders}</p>
      <h1>{c.ordersTitle}</h1>
      <p className="ref-lead">{c.ordersLead}</p>
      <div className="ref-filters">
        <SearchField
          label={c.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label={c.filter}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: "all", label: c.all },
            { value: "DECLARED", label: c.declared },
            { value: "CONFIRMED", label: c.confirmed },
          ]}
        />
      </div>
      <ul className="ref-orders">
        {rows.map((o) => (
          <li key={o.id} className="ref-order">
            <div>
              <strong>{o.id}</strong>
              <p className="ref-muted">{c.agreement} v1</p>
            </div>
            <div>
              <span className="ref-mobile-label">{c.execution}</span>
              <OrderStatusBadge status="PREPARING" />
            </div>
            <div>
              <span className="ref-mobile-label">{c.payment}</span>
              <PaymentStatusBadge status={o.status} source={o.source} />
            </div>
            <Price amountMinor={o.amount} currency="XOF" />
            <Button
              variant="ghost"
              onClick={() => setSelected(o)}
              aria-label={`${c.view} ${o.id}`}
            >
              {c.view}
            </Button>
          </li>
        ))}
      </ul>
      {!rows.length && (
        <div className="ref-empty">
          <p>{c.empty}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setFilter("all");
              setQuery("");
            }}
          >
            {c.clear}
          </Button>
        </div>
      )}
      <Dialog
        open={selected !== null}
        title={selected?.id ?? c.orders}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <p>{c.orderInfo}</p>
            <Price amountMinor={selected.amount} currency="XOF" />
            <h3>{c.payment}</h3>
            <PaymentStatusBadge
              status={selected.status}
              source={selected.source}
            />
            <h3>{c.execution}</h3>
            <OrderStatusBadge status="PREPARING" />
          </>
        )}
        <Button variant="secondary" onClick={() => setSelected(null)}>
          {c.cancel}
        </Button>
      </Dialog>
    </>
  );
}
export function CashbookView() {
  const { locale } = useDesign();
  const c = extendedMessages[locale];
  const [filter, setFilter] = useState("all");
  const rows = [
    {
      id: "REC-001",
      amount: 80000,
      source: "SELLER_MANUAL" as const,
      time: "09:20",
    },
    {
      id: "REC-002",
      amount: 40000,
      source: "SELLER_MANUAL" as const,
      time: "11:45",
    },
    {
      id: "REC-003",
      amount: 80000,
      source: "PROVIDER" as const,
      time: "14:10",
    },
  ];
  return (
    <>
      <p className="ref-kicker">Boutique Naya · {c.cashbook}</p>
      <h1>{c.cashTitle}</h1>
      <p className="ref-lead">{c.cashLead}</p>
      <div className="ref-metrics">
        <div className="ref-metric">
          <span>{c.receipts}</span>
          <Price amountMinor={200000} currency="XOF" />
        </div>
        <div className="ref-metric">
          <span>{c.pending}</span>
          <Price amountMinor={25000} currency="XOF" />
        </div>
      </div>
      <div className="ref-filters">
        <Select
          label={c.source}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: "all", label: c.all },
            { value: "SELLER_MANUAL", label: c.manual },
            { value: "PROVIDER", label: c.provider },
          ]}
        />
      </div>
      <ol className="ref-journal">
        {rows
          .filter((r) => filter === "all" || r.source === filter)
          .map((r) => (
            <li key={r.id}>
              <time>{r.time}</time>
              <div>
                <strong>
                  {c.entry} · {r.id}
                </strong>
                <p className="ref-muted">
                  {c.actor} : {r.source === "PROVIDER" ? c.provider : c.manual}
                </p>
                <PaymentStatusBadge status="CONFIRMED" source={r.source} />
              </div>
              <Price amountMinor={r.amount} currency="XOF" />
            </li>
          ))}
      </ol>
      <p className="ref-source-note">{c.immutable}</p>
    </>
  );
}
