import React, { useState } from "react";
import { SafeAreaView, ScrollView, StatusBar } from "react-native";
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
import { useDesign } from "./provider";
import * as UI from "./components";

export default function ComponentGallery() {
  const { t, locale, mode, theme, colors, setLocale, setMode } = useDesign();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("available");
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [radio, setRadio] = useState("pickup");
  const [tab, setTab] = useState("buyer");
  const [nav, setNav] = useState("discover");
  const [modal, setModal] = useState<"dialog" | "sheet" | null>(null);
  const [toast, setToast] = useState(false);
  const announce = () => setToast(true);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.canvas}
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <UI.Header title="Component Gallery" />
        <UI.Label variant="display">{t.gallery}</UI.Label>
        <UI.Label muted>{t.demo}</UI.Label>
        <UI.ResponsiveGrid>
          <UI.Select
            label={t.language}
            value={locale}
            onChange={(v) => setLocale(v as Locale)}
            options={[
              { value: "fr", label: "Français" },
              { value: "en", label: "English" },
            ]}
          />
          <UI.Select
            label={t.theme}
            value={mode}
            onChange={(v) => setMode(v as ThemeMode)}
            options={(["system", "light", "dark"] as const).map((value) => ({
              value,
              label: t[value],
            }))}
          />
        </UI.ResponsiveGrid>
        <UI.Label variant="h2">01 · {t.foundations}</UI.Label>
        <UI.Card>
          <UI.Stack>
            <UI.Label variant="display">{t.subtitle}</UI.Label>
            <UI.Label>{t.formHint}</UI.Label>
            <UI.Price amountMinor={500000} currency="XOF" />
            {(["canvas", "surface", "action", "accent"] as const).map((key) => (
              <UI.Label key={key}>
                {key} · {palette[theme][key]}
              </UI.Label>
            ))}
          </UI.Stack>
        </UI.Card>
        <UI.Label variant="h2">02 · {t.actions}</UI.Label>
        <UI.Stack row>
          <UI.Button onPress={announce}>{t.save}</UI.Button>
          <UI.Button variant="secondary" onPress={announce}>
            {t.cancel}
          </UI.Button>
          <UI.Button variant="danger" onPress={() => setModal("dialog")}>
            {t.remove}
          </UI.Button>
          <UI.Button disabled>{t.disabled}</UI.Button>
          <UI.Button loading>{t.save}</UI.Button>
          <UI.IconButton label={t.close} icon="×" onPress={announce} />
        </UI.Stack>
        <UI.Card>
          <UI.Stack>
            <UI.TextField
              label={t.name}
              value={name}
              onChangeText={setName}
              hint={t.formHint}
            />
            <UI.TextField label={`${t.name} · ${t.error}`} error={t.required} />
            <UI.TextField
              label={t.disabled}
              editable={false}
              value={t.readonly}
            />
            <UI.SearchField value={search} onChangeText={setSearch} />
            <UI.Select
              label={t.category}
              value={category}
              onChange={setCategory}
              options={(["available", "digital"] as const).map((value) => ({
                value,
                label: t[value],
              }))}
            />
            <UI.Checkbox
              label={t.consent}
              checked={checked}
              onChange={setChecked}
            />
            <UI.Radio
              label={t.pickup}
              checked={radio === "pickup"}
              onChange={() => setRadio("pickup")}
            />
            <UI.Radio
              label={t.delivery}
              checked={radio === "delivery"}
              onChange={() => setRadio("delivery")}
            />
            <UI.Switch
              label={t.notifications}
              checked={enabled}
              onChange={setEnabled}
            />
          </UI.Stack>
        </UI.Card>
        <UI.Label variant="h2">03 · {t.commerce}</UI.Label>
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
        </UI.ResponsiveGrid>
        <UI.Stack row>
          {(
            ["available", "onOrder", "toConfirm", "soldOut", "digital"] as const
          ).map((s) => (
            <UI.Badge key={s}>{t[s]}</UI.Badge>
          ))}
          <UI.Currency code="XOF" />
          {Object.keys(orderStatuses).map((s) => (
            <UI.OrderStatusBadge
              key={s}
              status={s as keyof typeof orderStatuses}
            />
          ))}
        </UI.Stack>
        <UI.Label variant="h2">04 · {t.finance}</UI.Label>
        <UI.MoneySummaryCard summary={exampleSummary} />
        <UI.Card>
          <UI.Stack>
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
        <UI.Stack row>
          {Object.keys(paymentSources).map((s) => (
            <UI.PaymentSourceBadge key={s} source={s as PaymentSource} />
          ))}
        </UI.Stack>
        <UI.Stack>
          {Object.keys(paymentStatuses).map((s) => (
            <UI.PaymentStatusBadge
              key={s}
              status={s as PaymentStatus}
              source={s === "CONFIRMED" ? "PROVIDER" : "UNKNOWN"}
            />
          ))}
          <UI.PaymentStatusBadge status="CONFIRMED" source="SELLER_MANUAL" />
        </UI.Stack>
        <UI.DayClosePanel
          summary={exampleSummary}
          onCloseDay={() => setModal("dialog")}
        />
        <UI.Label variant="h2">05 · {t.feedback}</UI.Label>
        <UI.Stack row>
          {Object.keys(syncStatuses).map((s) => (
            <UI.SyncStateBadge
              key={s}
              status={s as keyof typeof syncStatuses}
            />
          ))}
        </UI.Stack>
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
        <UI.Label variant="h2">06 · {t.navigation}</UI.Label>
        <UI.AppBar title={t.sampleShop}>
          <UI.Avatar name={t.sampleShop} />
        </UI.AppBar>
        <UI.Tabs
          label={t.preview}
          value={tab}
          onChange={setTab}
          items={[
            { id: "buyer", label: t.buyer },
            { id: "merchant", label: t.merchant },
          ]}
        />
        <UI.Label>{tab === "buyer" ? t.buyer : t.merchant}</UI.Label>
        <UI.BottomNavigation
          label={t.navigation}
          value={nav}
          onChange={setNav}
          items={(
            ["discover", "requests", "purchases", "profile"] as const
          ).map((id) => ({ id, label: t[id] }))}
        />
        <UI.Label variant="h2">07 · {t.overlays}</UI.Label>
        <UI.Button onPress={() => setModal("dialog")}>{t.openDialog}</UI.Button>
        <UI.Button variant="secondary" onPress={() => setModal("sheet")}>
          {t.openSheet}
        </UI.Button>
        <UI.Button variant="secondary" onPress={announce}>
          {t.showToast}
        </UI.Button>
      </ScrollView>
      <UI.Dialog
        open={modal === "dialog"}
        title={t.dialog}
        onClose={() => setModal(null)}
      >
        <UI.Label>{t.dialogBody}</UI.Label>
        <UI.Button
          onPress={() => {
            setModal(null);
            announce();
          }}
        >
          {t.confirm}
        </UI.Button>
      </UI.Dialog>
      <UI.BottomSheet
        open={modal === "sheet"}
        title={t.details}
        onClose={() => setModal(null)}
      >
        <UI.Label>{t.dialogBody}</UI.Label>
        <UI.Button onPress={() => setModal(null)}>{t.close}</UI.Button>
      </UI.BottomSheet>
      {toast && <UI.Toast message={t.saved} onClose={() => setToast(false)} />}
    </SafeAreaView>
  );
}
