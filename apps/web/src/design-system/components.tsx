"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import {
  formatMoney,
  paymentStatuses,
  paymentSources,
  orderStatuses,
  syncStatuses,
  type Money,
  type MoneySummary,
  type PaymentSource,
  type PaymentStatus,
  type ProductPreview,
  type Tone,
} from "@aifoundry/design-system";
import { useDesign } from "./provider";

export function Stack({
  children,
  row = false,
  className = "",
}: {
  children: ReactNode;
  row?: boolean;
  className?: string;
}) {
  return (
    <div className={`${row ? "ds-row" : "ds-stack"} ${className}`}>
      {children}
    </div>
  );
}
export function ResponsiveGrid({ children }: { children: ReactNode }) {
  return <div className="ds-grid">{children}</div>;
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`ds-card ${className}`}>{children}</div>;
}
export function Icon({
  name,
}: {
  name: "search" | "plus" | "close" | "arrow" | "bag" | "sun" | "moon";
}) {
  const paths = {
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    plus: "M12 5v14M5 12h14",
    close: "m6 6 12 12M6 18 18 6",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    bag: "M5 7h14l1 14H4L5 7m3 0V5a4 4 0 0 1 8 0v2",
    sun: "M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
    moon: "M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function Button({
  children,
  variant = "primary",
  loading = false,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}) {
  const { t } = useDesign();
  const gate = useRef(false);
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={`ds-button ${variant} ${props.className ?? ""}`}
      disabled={props.disabled || loading}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (gate.current) return;
        gate.current = true;
        window.setTimeout(() => {
          gate.current = false;
        }, 400);
        onClick?.(e);
      }}
    >
      {loading && <span className="ds-spinner" aria-hidden="true" />}
      {loading ? t.loading : children}
    </button>
  );
}
export function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  onClick: () => void;
}) {
  return (
    <Button
      variant="secondary"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon name={icon} />
    </Button>
  );
}
export function TextField({
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  const generated = useId();
  const id = props.id ?? generated;
  return (
    <div className="ds-field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        className="ds-input"
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-help` : undefined}
      />
      {(error || hint) && (
        <span id={`${id}-help`} className={error ? "ds-error" : "ds-muted"}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
export function SearchField(
  props: Omit<Parameters<typeof TextField>[0], "label"> & { label?: string },
) {
  const { t } = useDesign();
  return <TextField {...props} type="search" label={props.label ?? t.search} />;
}
export function Select({
  label,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className="ds-field">
      <label htmlFor={id}>{label}</label>
      <select {...props} id={id} className="ds-input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export function Checkbox({
  label,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }) {
  return (
    <label className="ds-choice">
      <input {...props} type="checkbox" />
      {label}
    </label>
  );
}
export function Radio({
  label,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }) {
  return (
    <label className="ds-choice">
      <input {...props} type="radio" />
      {label}
    </label>
  );
}
export function Switch({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="ds-choice ds-switch"
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="ds-switch-track" aria-hidden="true">
        <span />
      </span>
      {label}
    </button>
  );
}
export function Badge({
  children,
  tone = "neutral",
  outline = false,
}: {
  children: ReactNode;
  tone?: Tone;
  outline?: boolean;
}) {
  return (
    <span className={`ds-badge ${tone} ${outline ? "outline" : ""}`}>
      {children}
    </span>
  );
}
export function PaymentSourceBadge({ source }: { source: PaymentSource }) {
  const { t } = useDesign();
  const s = paymentSources[source];
  return (
    <Badge tone={s.tone} outline={s.outline}>
      <span aria-hidden="true">{s.symbol}</span> {t[s.label]}
    </Badge>
  );
}
export function PaymentStatusBadge({
  status,
  source,
}: {
  status: PaymentStatus;
  source: PaymentSource;
}) {
  const { t } = useDesign();
  const s = paymentStatuses[status];
  return (
    <Stack>
      <Badge tone={s.tone}>{t[s.label]}</Badge>
      <PaymentSourceBadge source={source} />
    </Stack>
  );
}
export function OrderStatusBadge({
  status,
}: {
  status: keyof typeof orderStatuses;
}) {
  const { t } = useDesign();
  return (
    <Badge tone={status === "DISPUTED" ? "error" : "neutral"}>
      {t[orderStatuses[status]]}
    </Badge>
  );
}
export function SyncStateBadge({
  status,
}: {
  status: keyof typeof syncStatuses;
}) {
  const { t } = useDesign();
  return (
    <Badge
      tone={
        status === "CONFLICT"
          ? "error"
          : status === "SYNCED"
            ? "success"
            : "pending"
      }
    >
      {t[syncStatuses[status]]}
    </Badge>
  );
}
export function Currency({ code }: { code: string }) {
  return <span className="ds-currency">{code}</span>;
}
export function Price(props: Money) {
  const { locale } = useDesign();
  return <span className="ds-price">{formatMoney(props, locale)}</span>;
}
export function Avatar({ name }: { name: string }) {
  return (
    <span className="ds-avatar" role="img" aria-label={name}>
      {name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")}
    </span>
  );
}
export function ProductCard({
  product,
  onOpen,
}: {
  product: ProductPreview;
  onOpen: () => void;
}) {
  const { t } = useDesign();
  return (
    <Card className="ds-product">
      <div className="ds-product-image">
        <ProductImage
          key={product.image}
          image={product.image}
          title={product.title}
          fallback={t.noImage}
        />
      </div>
      <Stack>
        <span className="ds-muted">{product.shop}</span>
        <h3>{product.title}</h3>
        <Price amountMinor={product.amountMinor} currency={product.currency} />
        <Badge
          tone={product.availability === "available" ? "success" : "neutral"}
        >
          {t[product.availability]}
        </Badge>
        <Button variant="secondary" onClick={onOpen}>
          {t.view}
          <Icon name="arrow" />
        </Button>
      </Stack>
    </Card>
  );
}
export function ShopCard({
  name,
  description,
  onOpen,
}: {
  name: string;
  description: string;
  onOpen: () => void;
}) {
  const { t } = useDesign();
  return (
    <Card>
      <Stack>
        <Avatar name={name} />
        <h3>{name}</h3>
        <p className="ds-muted">{description}</p>
        <Button variant="secondary" onClick={onOpen}>
          {t.shop}
        </Button>
      </Stack>
    </Card>
  );
}
function ProductImage({
  image,
  title,
  fallback,
}: {
  image?: string;
  title: string;
  fallback: string;
}) {
  const [failed, setFailed] = useState(false);
  return image && !failed ? (
    <img
      src={image}
      alt={title}
      loading="lazy"
      width={320}
      height={180}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  ) : (
    <>
      <Icon name="bag" />
      <span>{fallback}</span>
    </>
  );
}
export function Loading() {
  const { t } = useDesign();
  return (
    <div role="status" className="ds-row">
      <span className="ds-spinner" aria-hidden="true" />
      {t.loading}
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="ds-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
export function StatePanel({
  kind,
  onRetry,
}: {
  kind: "empty" | "error" | "offline" | "forbidden";
  onRetry?: () => void;
}) {
  const { t } = useDesign();
  return (
    <Card>
      <div role={kind === "error" ? "alert" : "status"} className="ds-stack">
        <span className="ds-state-symbol" aria-hidden="true">
          {kind === "empty"
            ? "—"
            : kind === "offline"
              ? "↻"
              : kind === "forbidden"
                ? "⊘"
                : "!"}
        </span>
        <h3>{t[kind]}</h3>
        <p className="ds-muted">{t[`${kind}Body`]}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            {t.retry}
          </Button>
        )}
      </div>
    </Card>
  );
}
export const EmptyState = () => <StatePanel kind="empty" />;
export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <StatePanel kind="error" onRetry={onRetry} />
);
export const OfflineState = ({ onRetry }: { onRetry: () => void }) => (
  <StatePanel kind="offline" onRetry={onRetry} />
);
export const ForbiddenState = () => <StatePanel kind="forbidden" />;
export function Tabs({
  items,
  value,
  onChange,
  label,
  panelId,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  panelId?: string;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className="ds-tabs">
      {items.map((item, index) => (
        <button
          id={`${id}-${item.id}`}
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          aria-controls={panelId}
          tabIndex={value === item.id ? 0 : -1}
          onClick={() => onChange(item.id)}
          onKeyDown={(e) => {
            const step =
              e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            const next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? items.length - 1
                  : step
                    ? (index + step + items.length) % items.length
                    : -1;
            if (next >= 0) {
              e.preventDefault();
              onChange(items[next].id);
              document.getElementById(`${id}-${items[next].id}`)?.focus();
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export function BottomNavigation({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <nav className="ds-bottom-nav" aria-label={label}>
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          aria-current={value === item.id ? "page" : undefined}
          onClick={() => onChange(item.id)}
        >
          <span aria-hidden="true">{["◇", "≡", "▢", "○"][i % 4]}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
export function Header({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="ds-header">
      <strong>{title}</strong>
      <div className="ds-row">{children}</div>
    </header>
  );
}
export const AppBar = Header;
export function Dialog({
  open,
  title,
  children,
  onClose,
  sheet = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  sheet?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const { t } = useDesign();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`ds-dialog ${sheet ? "sheet" : ""}`}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <Stack>
        <div className="ds-header">
          <h2 id={id}>{title}</h2>
          <IconButton label={t.close} icon="close" onClick={onClose} />
        </div>
        {children}
      </Stack>
    </dialog>
  );
}
export const BottomSheet = (
  props: Omit<Parameters<typeof Dialog>[0], "sheet">,
) => <Dialog {...props} sheet />;
export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const { t } = useDesign();
  return (
    <div className="ds-toast">
      <span role="status">{message}</span>
      <IconButton label={t.close} icon="close" onClick={onClose} />
    </div>
  );
}
export const Snackbar = Toast;
export function MoneySummaryCard({ summary }: { summary: MoneySummary }) {
  const { t } = useDesign();
  return (
    <Card>
      <div className="ds-money-grid">
        {(["sold", "received", "outstanding", "refunded"] as const).map(
          (key) => (
            <div key={key}>
              <span className="ds-muted">
                {t[key === "refunded" ? "refundedAmount" : key]}
              </span>
              <Price amountMinor={summary[key]} currency={summary.currency} />
            </div>
          ),
        )}
      </div>
    </Card>
  );
}
export function PartialPaymentProgress({
  received,
  outstanding,
  currency,
}: {
  received: number;
  outstanding: number;
  currency: string;
}) {
  const { t } = useDesign();
  const total = received + outstanding;
  return (
    <Stack>
      <label>
        {t.partial}
        <progress
          aria-label={t.partial}
          value={received}
          max={Math.max(1, total)}
        />
      </label>
      <div className="ds-money-grid">
        <span>
          {t.received}
          <Price amountMinor={received} currency={currency} />
        </span>
        <span>
          {t.outstanding}
          <Price amountMinor={outstanding} currency={currency} />
        </span>
      </div>
    </Stack>
  );
}
export function CashbookRow({
  amountMinor,
  currency,
  direction,
  source,
  reference,
  actor,
}: {
  amountMinor: number;
  currency: string;
  direction: "in" | "out";
  source: PaymentSource;
  reference: string;
  actor: string;
}) {
  const { t } = useDesign();
  return (
    <div className="ds-cashbook">
      <Stack>
        <strong>
          {direction === "in" ? t.entry : t.exit} · {reference}
        </strong>
        <span className="ds-muted">
          {t.actor} {actor}
        </span>
        <PaymentSourceBadge source={source} />
      </Stack>
      <Price amountMinor={amountMinor} currency={currency} />
    </div>
  );
}
export function ReconciliationCard({
  expected,
  confirmed,
  difference,
  currency,
}: {
  expected: number;
  confirmed: number;
  difference: number;
  currency: string;
}) {
  const { t } = useDesign();
  return (
    <Card>
      <Stack>
        <h3>{t.reconciliation}</h3>
        {[
          { label: t.expected, value: expected },
          { label: t.received, value: confirmed },
          { label: t.difference, value: difference },
        ].map((row) => (
          <div className="ds-cashbook" key={row.label}>
            <span>{row.label}</span>
            <Price amountMinor={row.value} currency={currency} />
          </div>
        ))}
        {difference !== 0 && <Badge tone="pending">{t.review}</Badge>}
      </Stack>
    </Card>
  );
}
export function DayClosePanel({
  summary,
  onCloseDay,
}: {
  summary: MoneySummary;
  onCloseDay: (note: string) => void;
}) {
  const { t } = useDesign();
  const [note, setNote] = useState("");
  const [reviewed, setReviewed] = useState(false);
  return (
    <Card>
      <Stack>
        <h3>{t.dayClose}</h3>
        <MoneySummaryCard summary={summary} />
        <TextField
          label={t.note}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Checkbox
          label={t.reviewed}
          checked={reviewed}
          onChange={(e) => setReviewed(e.target.checked)}
        />
        <Button disabled={!reviewed} onClick={() => onCloseDay(note)}>
          {t.closeDay}
        </Button>
      </Stack>
    </Card>
  );
}
