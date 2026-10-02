"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { Locale, ThemeMode } from "@aifoundry/design-system";
import { DesignProvider, useDesign } from "../design-system/provider";
import {
  Button,
  Checkbox,
  Dialog,
  ErrorState,
  Icon,
  Loading,
  OrderStatusBadge,
  PaymentSourceBadge,
  PaymentStatusBadge,
  Price,
  SearchField,
  Select,
  Skeleton,
  TextField,
  Toast,
} from "../design-system/components";
import { referenceMessages } from "./messages";
import {
  RequestView,
  CompareView,
  OrdersView,
  CashbookView,
  extendedMessages,
  type ExtendedScreen,
} from "./extended";
import { reconciliation, referenceOrders, referenceSummary } from "./fixtures";

type Screen = "home" | "product" | "seller" | "close" | ExtendedScreen;
type ViewState =
  "normal" | "loading" | "refreshing" | "empty" | "error" | "offline" | "stale";
function useCopy() {
  const { locale } = useDesign();
  return referenceMessages[locale];
}
export function FinancialMetric({
  label,
  amount,
  emphasis = false,
}: {
  label: string;
  amount: number;
  emphasis?: boolean;
}) {
  return (
    <div className={`ref-metric ${emphasis ? "emphasis" : ""}`}>
      <span>{label}</span>
      <Price amountMinor={amount} currency="XOF" />
    </div>
  );
}
function FinancialStrip() {
  const c = useCopy();
  return (
    <div className="ref-metrics">
      <FinancialMetric label={c.sold} amount={referenceSummary.sold} />
      <FinancialMetric
        label={c.received}
        amount={referenceSummary.received}
        emphasis
      />
      <FinancialMetric
        label={c.outstanding}
        amount={referenceSummary.outstanding}
      />
    </div>
  );
}
export function OrderRow({
  order,
  onOpen,
}: {
  order: (typeof referenceOrders)[number];
  onOpen: () => void;
}) {
  const c = useCopy();
  return (
    <li className="ref-order">
      <div>
        <strong>{order.id}</strong>
        <p className="ref-muted">
          {c.customer} {order.customer.slice(-1)}
        </p>
      </div>
      <div>
        <span className="ref-mobile-label">{c.execution}</span>
        <OrderStatusBadge status="PREPARING" />
      </div>
      <div>
        <span className="ref-mobile-label">{c.payment}</span>
        <PaymentStatusBadge status={order.status} source={order.source} />
      </div>
      <Price amountMinor={order.amount} currency="XOF" />
      <Button
        variant="ghost"
        onClick={onOpen}
        aria-label={`${c.inspect} ${order.id}`}
      >
        {c.inspect}
        <Icon name="arrow" />
      </Button>
    </li>
  );
}
function ProductPhoto({ priority = false }: { priority?: boolean }) {
  const c = useCopy();
  const [failed, setFailed] = useState(false);
  return (
    <div className="ref-photo">
      {failed ? (
        <div className="ref-image-fallback">
          <Icon name="bag" />
          <span>{c.productName}</span>
        </div>
      ) : (
        <Image
          src="/reference-assets/market-tote.png"
          alt={c.productName}
          fill
          sizes="(max-width: 767px) 100vw, 50vw"
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
export function EditorialProduct({ onOpen }: { onOpen: () => void }) {
  const c = useCopy();
  return (
    <article>
      <button
        className="ref-photo-link"
        onClick={onOpen}
        aria-label={c.explore}
      >
        <ProductPhoto priority />
      </button>
      <div className="ref-product-caption">
        <div>
          <h3>{c.productName}</h3>
          <p className="ref-muted">{c.shop}</p>
        </div>
        <Price amountMinor={18500} currency="XOF" />
      </div>
    </article>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ref-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Home({
  navigate,
  preview,
}: {
  navigate: (s: Screen) => void;
  preview: () => void;
}) {
  const c = useCopy();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const visible =
    category !== "digital" &&
    `${c.productName} ${c.shop}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase());
  return (
    <>
      <div className="ref-search">
        <SearchField
          label={c.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="ref-category" aria-label={c.collection}>
        {(["all", "homeCategory", "accessories", "digital"] as const).map(
          (key) => (
            <button
              key={key}
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
            >
              {c[key]}
            </button>
          ),
        )}
      </div>
      <section className="ref-discovery">
        <div className="ref-editorial-copy">
          <p className="ref-kicker">{c.location}</p>
          <h1>{c.intro}</h1>
          <p className="ref-lead">{c.lead}</p>
          <div className="ref-collection-caption">
            <span className="ref-index" aria-hidden="true">
              01
            </span>
            <div>
              <h2>{c.collection}</h2>
              <p className="ref-muted">{c.collectionBody}</p>
            </div>
          </div>
        </div>
        {visible ? (
          <EditorialProduct onOpen={() => navigate("product")} />
        ) : (
          <div className="ref-empty">
            <h2>{c.noResults}</h2>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              {c.reset}
            </Button>
          </div>
        )}
      </section>
      <div className="ref-request">
        <div>
          <h2>{c.requestTitle}</h2>
          <p className="ref-muted">{c.requestBody}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("requests")}>
          {c.requestAction}
          <Icon name="arrow" />
        </Button>
      </div>
      <Section title={c.selection}>
        <div className="ref-simple-products">
          {[
            { title: c.stationery, price: 4500, kind: c.shop },
            { title: c.template, price: 2500, kind: c.digital },
          ].map((item) => (
            <button key={item.title} onClick={preview}>
              <span className="ref-small-visual">
                <Icon name="bag" />
              </span>
              <span>
                <strong>{item.title}</strong>
                <span className="ref-muted">{item.kind}</span>
                <Price amountMinor={item.price} currency="XOF" />
              </span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
function Product({
  navigate,
  preview,
  disabled,
}: {
  navigate: (s: Screen) => void;
  preview: () => void;
  disabled: boolean;
}) {
  const c = useCopy();
  const [terms, setTerms] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => navigate("home")}>
        {c.back}
      </Button>
      <div className="ref-detail">
        <div>
          <ProductPhoto priority />
          <p className="ref-photo-note">{c.photo}</p>
        </div>
        <div className="ref-detail-copy">
          <p className="ref-kicker">{c.accessories}</p>
          <h1>{c.productName}</h1>
          <Price amountMinor={18500} currency="XOF" />
          <p className="ref-availability">{c.available}</p>
          <p className="ref-lead">{c.productBody}</p>
          <fieldset className="ref-variant">
            <legend>{c.variant}</legend>
            <label>
              <input type="radio" checked readOnly name="finish" />
              {c.natural}
            </label>
          </fieldset>
          <div className="ref-merchant">
            <span className="ref-monogram" aria-hidden="true">
              AN
            </span>
            <div>
              <strong>{c.shop}</strong>
              <p className="ref-muted">{c.shopCaption}</p>
            </div>
          </div>
          <div className="ref-buy-action">
            <Button disabled={disabled} onClick={() => setTerms(true)}>
              {c.review}
            </Button>
            <Button variant="ghost" onClick={preview}>
              {c.question}
            </Button>
          </div>
          <details open>
            <summary>{c.details}</summary>
            <p>{c.material}</p>
            <p className="ref-muted">{c.size}</p>
          </details>
          <details open>
            <summary>{c.delivery}</summary>
            <p className="ref-muted">{c.deliveryBody}</p>
          </details>
          <details>
            <summary>{c.terms}</summary>
            <p className="ref-muted">{c.termsBody}</p>
          </details>
        </div>
      </div>
      <Dialog open={terms} title={c.terms} onClose={() => setTerms(false)}>
        <p>{c.termsBody}</p>
        <Button variant="secondary" onClick={() => setTerms(false)}>
          {c.cancel}
        </Button>
      </Dialog>
    </>
  );
}
function Seller({
  navigate,
  preview,
}: {
  navigate: (s: Screen) => void;
  preview: () => void;
}) {
  const c = useCopy();
  return (
    <>
      <div className="ref-seller-heading">
        <div>
          <p className="ref-kicker">
            {c.shop} · {c.merchant}
          </p>
          <h1>{c.today}</h1>
          <p className="ref-muted">{c.date}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("close")}>
          {c.closeAction}
          <Icon name="arrow" />
        </Button>
      </div>
      <Section title={c.attention}>
        <div className="ref-attention">
          <div>
            <h3>{c.reviewPayments}</h3>
            <p>{c.reviewPaymentsBody}</p>
          </div>
          <Button onClick={() => navigate("close")}>{c.inspect}</Button>
        </div>
      </Section>
      <Section title={c.finances}>
        <FinancialStrip />
        <p className="ref-source-note">{c.salesOrigin}</p>
      </Section>
      <Section title={c.orders}>
        <div className="ref-order-head" aria-hidden="true">
          <span>{c.order}</span>
          <span>{c.execution}</span>
          <span>{c.payment}</span>
          <span>{c.amount}</span>
          <span />
        </div>
        <ul className="ref-orders">
          {referenceOrders.map((order) => (
            <OrderRow key={order.id} order={order} onOpen={preview} />
          ))}
        </ul>
      </Section>
      <div className="ref-operational">
        <Section title={c.lowStock}>
          <p>{c.lowStockBody}</p>
          <Button variant="ghost" onClick={preview}>
            {c.inspect}
            <Icon name="arrow" />
          </Button>
        </Section>
        <Section title={c.opportunities}>
          <p>{c.opportunityBody}</p>
          <Button variant="ghost" onClick={preview}>
            {c.inspect}
            <Icon name="arrow" />
          </Button>
        </Section>
      </div>
    </>
  );
}
function DailyClose({
  disabled,
  announce,
}: {
  disabled: boolean;
  announce: () => void;
}) {
  const c = useCopy();
  const [reviewed, setReviewed] = useState(false);
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [showDifference, setShowDifference] = useState(false);
  return (
    <>
      <div className="ref-seller-heading">
        <div>
          <p className="ref-kicker">
            {c.shop} · {c.close}
          </p>
          <h1>{c.closeHeading}</h1>
          <p className="ref-muted">{c.date}</p>
        </div>
      </div>
      <p className="ref-lead">{c.closeLead}</p>
      <FinancialStrip />
      <div className="ref-refunds">
        <span>{c.refunds}</span>
        <Price amountMinor={0} currency="XOF" />
      </div>
      <div className="ref-close-layout">
        <div>
          <Section title={c.breakdown}>
            <div className="ref-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{c.method}</th>
                    <th>{c.expected}</th>
                    <th>{c.confirmed}</th>
                    <th>{c.difference}</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliation.map((row) => (
                    <tr key={row.method}>
                      <th scope="row">
                        <strong>{c[row.method]}</strong>
                        <PaymentSourceBadge source={row.source} />
                      </th>
                      <td data-label={c.expected}>
                        <Price amountMinor={row.expected} currency="XOF" />
                      </td>
                      <td data-label={c.confirmed}>
                        <Price amountMinor={row.confirmed} currency="XOF" />
                      </td>
                      <td data-label={c.difference}>
                        <Price
                          amountMinor={row.expected - row.confirmed}
                          currency="XOF"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          <div className="ref-discrepancy">
            <h2>{c.discrepancies}</h2>
            <p>{c.discrepancyBody}</p>
            <Button
              variant="ghost"
              onClick={() => setShowDifference(!showDifference)}
              aria-expanded={showDifference}
            >
              {c.inspect}
              <Icon name="arrow" />
            </Button>
            {showDifference && (
              <div className="ref-difference-detail">
                <strong>DEMO-024</strong>
                <PaymentStatusBadge
                  status="REVIEW_REQUIRED"
                  source="SELLER_MANUAL"
                />
                <Price amountMinor={5000} currency="XOF" />
              </div>
            )}
          </div>
        </div>
        <section className="ref-close-form" aria-label={c.closeDay}>
          <h2>{c.closeDay}</h2>
          <TextField
            label={c.note}
            hint={c.noteHint}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={disabled}
          />
          <Checkbox
            label={c.reviewed}
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            disabled={disabled}
          />
          <Button
            disabled={disabled || !reviewed}
            onClick={() => setConfirm(true)}
          >
            {c.closeDay}
          </Button>
          <p className="ref-muted">{c.closeExplain}</p>
        </section>
      </div>
      <Dialog
        open={confirm}
        title={c.confirmTitle}
        onClose={() => setConfirm(false)}
      >
        <p>{c.confirmBody}</p>
        <FinancialStrip />
        {note && <p>{note}</p>}
        <Button
          disabled={disabled}
          onClick={() => {
            setConfirm(false);
            announce();
          }}
        >
          {c.confirm}
        </Button>
        <Button variant="secondary" onClick={() => setConfirm(false)}>
          {c.cancel}
        </Button>
      </Dialog>
    </>
  );
}
function Content() {
  const { t, locale, mode, setLocale, setMode } = useDesign();
  const c = useCopy();
  const [screen, setScreen] = useState<Screen>("home");
  const [state, setState] = useState<ViewState>("normal");
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState(false);
  const navigate = (s: Screen) => {
    setScreen(s);
    setState("normal");
    setToast(false);
  };
  const blocked =
    state === "offline" || state === "stale" || state === "refreshing";
  return (
    <div className="ref-shell">
      <aside className="ref-review-bar" aria-label={c.prototype}>
        <span>{c.prototype}</span>
        <div>
          <Select
            label={t.language}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            options={[
              { value: "fr", label: "Français" },
              { value: "en", label: "English" },
            ]}
          />
          <Select
            label={t.theme}
            value={mode}
            onChange={(e) => setMode(e.target.value as ThemeMode)}
            options={(["system", "light", "dark"] as const).map((value) => ({
              value,
              label: t[value],
            }))}
          />
          <Select
            label={c.states}
            value={state}
            onChange={(e) => setState(e.target.value as ViewState)}
            options={(
              [
                "normal",
                "loading",
                "refreshing",
                "empty",
                "error",
                "offline",
                "stale",
              ] as const
            ).map((value) => ({ value, label: c[value] }))}
          />
        </div>
      </aside>
      <div className="ref-frame">
        <header className="ref-header">
          <span className="ref-wordmark">
            {c.brand}
            <span aria-hidden="true">.</span>
          </span>
          <div className="ref-workspace">
            <button
              data-workspace="buyer"
              onClick={() => navigate("home")}
              aria-pressed={
                !["seller", "close", "orders", "cashbook"].includes(screen)
              }
            >
              {c.buyer}
            </button>
            <button
              data-workspace="seller"
              onClick={() => navigate("seller")}
              aria-pressed={["seller", "close", "orders", "cashbook"].includes(
                screen,
              )}
            >
              {c.merchant}
            </button>
          </div>
          <nav aria-label={c.nav}>
            {(["seller", "close", "orders", "cashbook"].includes(screen)
              ? (["seller", "orders", "cashbook", "close"] as const)
              : (["home", "product", "requests", "compare"] as const)
            ).map((s) => (
              <button
                key={s}
                data-screen-target={s}
                aria-current={screen === s ? "page" : undefined}
                onClick={() => navigate(s)}
              >
                {s in c
                  ? c[s as "home"]
                  : extendedMessages[locale][s as ExtendedScreen]}
              </button>
            ))}
          </nav>
        </header>
        <main
          id="reference-content"
          data-screen={screen}
          className={`ref-content ${["seller", "close", "orders", "cashbook"].includes(screen) ? "ref-seller" : "ref-buyer"}`}
        >
          {(state === "offline" ||
            state === "stale" ||
            state === "refreshing") && (
            <div role="status" className="ref-state-banner">
              <p>{c[`${state}Body`]}</p>
              <Button variant="secondary" onClick={() => setState("normal")}>
                {c.retry}
              </Button>
            </div>
          )}
          {state === "loading" ? (
            <div className="ref-state-view">
              <Loading />
              <Skeleton />
            </div>
          ) : state === "error" ? (
            <ErrorState onRetry={() => setState("normal")} />
          ) : state === "empty" ? (
            <div className="ref-empty">
              <h1>{c.empty}</h1>
              <p>{c.emptyBody}</p>
              <Button onClick={() => setState("normal")}>{c.retry}</Button>
            </div>
          ) : null}
          <div hidden={["loading", "empty", "error"].includes(state)}>
            {screen === "home" ? (
              <Home navigate={navigate} preview={() => setPreview(true)} />
            ) : screen === "product" ? (
              <Product
                navigate={navigate}
                preview={() => setPreview(true)}
                disabled={blocked}
              />
            ) : screen === "seller" ? (
              <Seller navigate={navigate} preview={() => navigate("orders")} />
            ) : screen === "requests" ? (
              <RequestView
                disabled={blocked}
                onCompare={() => navigate("compare")}
              />
            ) : screen === "compare" ? (
              <CompareView disabled={blocked} />
            ) : screen === "orders" ? (
              <OrdersView />
            ) : screen === "cashbook" ? (
              <CashbookView />
            ) : (
              <DailyClose disabled={blocked} announce={() => setToast(true)} />
            )}
          </div>
        </main>
        <footer className="ref-footer">{c.prototype}</footer>
      </div>
      <Dialog
        open={preview}
        title={c.previewTitle}
        onClose={() => setPreview(false)}
      >
        <p>{c.previewBody}</p>
        <Button variant="secondary" onClick={() => setPreview(false)}>
          {t.close}
        </Button>
      </Dialog>
      {toast && <Toast message={c.done} onClose={() => setToast(false)} />}
    </div>
  );
}
export default function ReferenceApp() {
  return (
    <DesignProvider>
      <Content />
    </DesignProvider>
  );
}
