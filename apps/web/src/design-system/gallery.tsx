"use client";
import { useState } from "react";
import {
  palette,
  paymentStatuses,
  paymentSources,
  orderStatuses,
  syncStatuses,
  type Locale,
  type ThemeMode,
  type PaymentStatus,
  type PaymentSource,
} from "@aifoundry/design-system";
import {
  exampleProduct,
  exampleSummary,
} from "@aifoundry/design-system/src/fixtures";
import { DesignProvider, useDesign } from "./provider";
import * as UI from "./components";

function GalleryContent() {
  const { t, locale, mode, theme, setLocale, setMode } = useDesign();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState("pickup");
  const [enabled, setEnabled] = useState(true);
  const [tab, setTab] = useState("buyer");
  const [nav, setNav] = useState("discover");
  const [modal, setModal] = useState<"dialog" | "sheet" | null>(null);
  const [toast, setToast] = useState(false);
  const announce = () => setToast(true);
  const sections = [
    "foundations",
    "actions",
    "commerce",
    "finance",
    "feedback",
    "navigation",
    "overlays",
  ] as const;
  return (
    <main className="gallery">
      <div className="gallery-top">
        <UI.Header title="">
          <div className="gallery-mark">
            <span aria-hidden="true">◇</span>AI FOUNDRY · D01 + D02
          </div>
          <div className="gallery-toolbar">
            <UI.Select
              label={t.language}
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              options={[
                { value: "fr", label: "Français" },
                { value: "en", label: "English" },
              ]}
            />
            <UI.Select
              label={t.theme}
              value={mode}
              onChange={(e) => setMode(e.target.value as ThemeMode)}
              options={(["system", "light", "dark"] as const).map((v) => ({
                value: v,
                label: t[v],
              }))}
            />
          </div>
        </UI.Header>
      </div>
      <div className="gallery-hero">
        <p className="gallery-eyebrow">DESIGN SYSTEM / 01 · V3</p>
        <h1>{t.gallery}</h1>
        <p>{t.subtitle}</p>
        <div className="gallery-note">{t.demo}</div>
      </div>
      <nav className="gallery-nav" aria-label={t.gallery}>
        {sections.map((s) => (
          <a key={s} href={`#${s}`}>
            {t[s]}
          </a>
        ))}
      </nav>
      <section className="gallery-section" id="foundations">
        <h2>
          <span className="gallery-section-number">01</span>
          {t.foundations}
        </h2>
        <UI.Stack>
          <div className="gallery-token-grid">
            {(
              [
                "canvas",
                "surface",
                "subtle",
                "action",
                "accent",
                "text",
              ] as const
            ).map((key) => (
              <div key={key}>
                <div
                  className="gallery-swatch"
                  style={{ background: palette[theme][key] }}
                />
                <strong>{key}</strong>
                <div className="ds-muted">{palette[theme][key]}</div>
              </div>
            ))}
          </div>
          <UI.Card>
            <UI.Stack>
              <span className="ds-muted">{t.typography}</span>
              <p className="gallery-type">{t.subtitle}</p>
              <h3>{t.commerce}</h3>
              <p>{t.formHint}</p>
              <UI.Price amountMinor={500000} currency="XOF" />
            </UI.Stack>
          </UI.Card>
        </UI.Stack>
      </section>
      <section className="gallery-section" id="actions">
        <h2>
          <span className="gallery-section-number">02</span>
          {t.actions}
        </h2>
        <UI.Stack>
          <UI.Stack row>
            <UI.Button onClick={announce}>
              {t.save}
              <UI.Icon name="arrow" />
            </UI.Button>
            <UI.Button variant="secondary" onClick={announce}>
              {t.cancel}
            </UI.Button>
            <UI.Button variant="danger" onClick={() => setModal("dialog")}>
              {t.remove}
            </UI.Button>
            <UI.Button disabled>{t.disabled}</UI.Button>
            <UI.Button loading>{t.save}</UI.Button>
            <UI.IconButton label={t.search} icon="search" onClick={announce} />
          </UI.Stack>
          <UI.ResponsiveGrid>
            <UI.Card>
              <UI.Stack>
                <UI.TextField
                  label={t.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  hint={t.formHint}
                />
                <UI.TextField
                  label={`${t.name} · ${t.error}`}
                  error={t.required}
                />
                <UI.SearchField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <UI.Select
                  label={t.category}
                  options={[
                    { value: "stationery", label: t.sampleCategory },
                    { value: "digital", label: t.digital },
                  ]}
                />
              </UI.Stack>
            </UI.Card>
            <UI.Card>
              <UI.Stack>
                <UI.Checkbox
                  label={t.consent}
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <fieldset>
                  <legend>{t.select}</legend>
                  <UI.Radio
                    name="payment-demo"
                    label={t.pickup}
                    checked={radio === "pickup"}
                    onChange={() => setRadio("pickup")}
                  />
                  <UI.Radio
                    name="payment-demo"
                    label={t.delivery}
                    checked={radio === "delivery"}
                    onChange={() => setRadio("delivery")}
                  />
                </fieldset>
                <UI.Switch
                  label={t.notifications}
                  checked={enabled}
                  onChange={setEnabled}
                />
              </UI.Stack>
            </UI.Card>
          </UI.ResponsiveGrid>
        </UI.Stack>
      </section>
      <section className="gallery-section" id="commerce">
        <h2>
          <span className="gallery-section-number">03</span>
          {t.commerce}
        </h2>
        <UI.Stack>
          <UI.ResponsiveGrid>
            <UI.ProductCard
              product={exampleProduct(locale)}
              onOpen={() => setModal("sheet")}
            />
            <UI.ShopCard
              name={t.sampleShop}
              description={t.samplePlace}
              onOpen={() => setModal("sheet")}
            />
            <UI.Card>
              <UI.Stack>
                <h3>{t.allStates}</h3>
                {(
                  [
                    "available",
                    "onOrder",
                    "toConfirm",
                    "soldOut",
                    "digital",
                  ] as const
                ).map((s) => (
                  <UI.Badge key={s}>{t[s]}</UI.Badge>
                ))}
                <UI.Currency code="XOF" />
              </UI.Stack>
            </UI.Card>
          </UI.ResponsiveGrid>
          <UI.Stack row>
            {Object.keys(orderStatuses).map((s) => (
              <UI.OrderStatusBadge
                key={s}
                status={s as keyof typeof orderStatuses}
              />
            ))}
          </UI.Stack>
        </UI.Stack>
      </section>
      <section className="gallery-section" id="finance">
        <h2>
          <span className="gallery-section-number">04</span>
          {t.finance}
        </h2>
        <UI.Stack>
          <UI.MoneySummaryCard summary={exampleSummary} />
          <UI.ResponsiveGrid>
            <UI.Card>
              <UI.Stack>
                <h3>{t.partial}</h3>
                <UI.PartialPaymentProgress
                  received={200000}
                  outstanding={300000}
                  currency="XOF"
                />
                <UI.CashbookRow
                  amountMinor={200000}
                  currency="XOF"
                  direction="in"
                  source="SELLER_MANUAL"
                  reference="DEMO-001"
                  actor={t.sampleActor}
                />
              </UI.Stack>
            </UI.Card>
            <UI.ReconciliationCard
              expected={200000}
              confirmed={195000}
              difference={5000}
              currency="XOF"
            />
          </UI.ResponsiveGrid>
          <UI.Card>
            <UI.Stack>
              <h3>{t.allStates}</h3>
              <UI.Stack row>
                {Object.keys(paymentSources).map((s) => (
                  <UI.PaymentSourceBadge key={s} source={s as PaymentSource} />
                ))}
              </UI.Stack>
              <UI.ResponsiveGrid>
                {Object.keys(paymentStatuses).map((s) => (
                  <UI.PaymentStatusBadge
                    key={s}
                    status={s as PaymentStatus}
                    source={s === "CONFIRMED" ? "PROVIDER" : "UNKNOWN"}
                  />
                ))}
              </UI.ResponsiveGrid>
              <UI.PaymentStatusBadge
                status="CONFIRMED"
                source="SELLER_MANUAL"
              />
            </UI.Stack>
          </UI.Card>
          <UI.DayClosePanel
            summary={exampleSummary}
            onCloseDay={() => setModal("dialog")}
          />
        </UI.Stack>
      </section>
      <section className="gallery-section" id="feedback">
        <h2>
          <span className="gallery-section-number">05</span>
          {t.feedback}
        </h2>
        <UI.Stack>
          <UI.Stack row>
            {Object.keys(syncStatuses).map((s) => (
              <UI.SyncStateBadge
                key={s}
                status={s as keyof typeof syncStatuses}
              />
            ))}
          </UI.Stack>
          <UI.ResponsiveGrid>
            <UI.Card>
              <UI.Stack>
                <UI.Loading />
                <UI.Skeleton />
              </UI.Stack>
            </UI.Card>
            <UI.EmptyState />
            <UI.ErrorState onRetry={announce} />
            <UI.OfflineState onRetry={announce} />
            <UI.ForbiddenState />
          </UI.ResponsiveGrid>
        </UI.Stack>
      </section>
      <section className="gallery-section" id="navigation">
        <h2>
          <span className="gallery-section-number">06</span>
          {t.navigation}
        </h2>
        <UI.Stack>
          <UI.Header title={t.sampleShop}>
            <UI.Avatar name={t.sampleShop} />
          </UI.Header>
          <UI.Tabs
            panelId="gallery-tab-panel"
            label={t.preview}
            value={tab}
            onChange={setTab}
            items={[
              { id: "buyer", label: t.buyer },
              { id: "merchant", label: t.merchant },
            ]}
          />
          <p
            id="gallery-tab-panel"
            role="tabpanel"
            aria-label={tab === "buyer" ? t.buyer : t.merchant}
            tabIndex={0}
          >
            {tab === "buyer" ? t.buyer : t.merchant} · {t.preview}
          </p>
          <UI.BottomNavigation
            label={t.navigation}
            value={nav}
            onChange={setNav}
            items={(
              ["discover", "requests", "purchases", "profile"] as const
            ).map((v) => ({ id: v, label: t[v] }))}
          />
          <p>
            {t.preview} : {t[nav as "discover"]}
          </p>
        </UI.Stack>
      </section>
      <section className="gallery-section" id="overlays">
        <h2>
          <span className="gallery-section-number">07</span>
          {t.overlays}
        </h2>
        <UI.Stack row>
          <UI.Button onClick={() => setModal("dialog")}>
            {t.openDialog}
          </UI.Button>
          <UI.Button variant="secondary" onClick={() => setModal("sheet")}>
            {t.openSheet}
          </UI.Button>
          <UI.Button variant="secondary" onClick={announce}>
            {t.showToast}
          </UI.Button>
        </UI.Stack>
      </section>
      <footer className="gallery-footer">
        AI Foundry · Design System 1.3 · {t.demo}
      </footer>
      <UI.Dialog
        open={modal === "dialog"}
        title={t.dialog}
        onClose={() => setModal(null)}
      >
        <p>{t.dialogBody}</p>
        <UI.Stack row>
          <UI.Button
            onClick={() => {
              setModal(null);
              announce();
            }}
          >
            {t.confirm}
          </UI.Button>
          <UI.Button variant="secondary" onClick={() => setModal(null)}>
            {t.cancel}
          </UI.Button>
        </UI.Stack>
      </UI.Dialog>
      <UI.BottomSheet
        open={modal === "sheet"}
        title={t.details}
        onClose={() => setModal(null)}
      >
        <p>{t.dialogBody}</p>
        <UI.Button onClick={() => setModal(null)}>{t.close}</UI.Button>
      </UI.BottomSheet>
      {toast && <UI.Toast message={t.saved} onClose={() => setToast(false)} />}
    </main>
  );
}
export default function ComponentGallery() {
  return (
    <DesignProvider>
      <GalleryContent />
    </DesignProvider>
  );
}
