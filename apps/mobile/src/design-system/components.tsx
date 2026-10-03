import React, { useRef, useState } from "react";
type ReactNode = any;
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch as NativeSwitch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import {
  spacing,
  radii,
  typography,
  layout,
  formatMoney,
  paymentStatuses,
  paymentSources,
  orderStatuses,
  syncStatuses,
  type Money,
  type MoneySummary,
  type ProductPreview,
  type PaymentStatus,
  type PaymentSource,
  type Tone,
} from "@aifoundry/design-system";
import { useDesign } from "./provider";

export function Label({
  children,
  variant = "body",
  muted = false,
}: {
  children: ReactNode;
  variant?: keyof typeof typography;
  muted?: boolean;
}) {
  const { colors } = useDesign();
  const [fontSize, lineHeight] = typography[variant];
  return (
    <Text
      style={{
        color: muted ? colors.muted : colors.text,
        fontSize,
        lineHeight,
        fontFamily:
          variant === "display"
            ? Platform.OS === "android"
              ? "serif"
              : "Georgia"
            : undefined,
        fontWeight: ["h1", "h2", "h3", "price", "button"].includes(variant)
          ? "600"
          : "400",
        fontVariant: variant === "price" ? ["tabular-nums"] : undefined,
        flexShrink: 1,
      }}
    >
      {children}
    </Text>
  );
}
export function Stack({
  children,
  row = false,
  style,
}: {
  children: ReactNode;
  row?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          gap: spacing.lg,
          flexDirection: row ? "row" : "column",
          flexWrap: row ? "wrap" : "nowrap",
          alignItems: row ? "center" : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function ResponsiveGrid({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  return (
    <View
      style={{
        flexDirection: width >= layout.wide ? "row" : "column",
        gap: spacing.xxl,
      }}
    >
      {React.Children.map(children, (child) => (
        <View style={{ flex: 1, minWidth: 0 }}>{child}</View>
      ))}
    </View>
  );
}
export function Card({ children }: { children: ReactNode }) {
  const { colors } = useDesign();
  return (
    <View
      style={{
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.card,
        backgroundColor: colors.surface,
      }}
    >
      {children}
    </View>
  );
}
export function Button({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  label,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}) {
  const { colors, t } = useDesign();
  const last = useRef(0);
  const [focused, setFocused] = useState(false);
  const bg =
    variant === "primary"
      ? colors.action
      : variant === "danger"
        ? colors.errorBg
        : colors.surface;
  const fg =
    variant === "primary"
      ? colors.onAction
      : variant === "danger"
        ? colors.errorFg
        : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={() => {
        const now = Date.now();
        if (now - last.current < 400) return;
        last.current = now;
        onPress?.();
      }}
      style={({ pressed }) => ({
        minHeight: layout.touch,
        minWidth: layout.touch,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radii.field,
        borderWidth: focused ? 2 : 1,
        borderColor: focused
          ? colors.focus
          : variant === "secondary"
            ? colors.border
            : bg,
        backgroundColor: bg,
        opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: spacing.sm,
        flexShrink: 1,
      })}
    >
      {loading && <ActivityIndicator color={fg} />}
      <Text
        style={{
          color: fg,
          fontSize: 15,
          lineHeight: 20,
          fontWeight: "600",
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {loading ? t.loading : children}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) {
  return (
    <Button variant="secondary" label={label} onPress={onPress}>
      {icon}
    </Button>
  );
}
export function TextField({
  label,
  error,
  hint,
  ...props
}: TextInputProps & { label: string; error?: string; hint?: string }) {
  const { colors } = useDesign();
  const [focused, setFocused] = useState(false);
  return (
    <Stack style={{ gap: spacing.sm }}>
      <Label variant="secondary">{label}</Label>
      <TextInput
        {...props}
        accessibilityLabel={label}
        accessibilityHint={error || hint}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            minHeight: 48,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: radii.field,
            borderWidth: focused ? 2 : 1,
            borderColor: error
              ? colors.errorFg
              : focused
                ? colors.focus
                : colors.muted,
            color: colors.text,
            backgroundColor: colors.subtle,
            fontSize: 16,
          },
          props.style,
        ]}
      />
      {(error || hint) && (
        <Text
          accessibilityRole={error ? "alert" : undefined}
          style={{ fontSize: 14, color: error ? colors.errorFg : colors.muted }}
        >
          {error || hint}
        </Text>
      )}
    </Stack>
  );
}
export function SearchField(
  props: Omit<Parameters<typeof TextField>[0], "label"> & { label?: string },
) {
  const { t } = useDesign();
  return (
    <TextField
      {...props}
      label={props.label ?? t.search}
      returnKeyType="search"
    />
  );
}
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { colors } = useDesign();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{ fontSize: 24, color: colors.action }}
        accessibilityElementsHidden
      >
        {checked ? "☑" : "☐"}
      </Text>
      <Label>{label}</Label>
    </Pressable>
  );
}
export function Radio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const { colors } = useDesign();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked }}
      onPress={onChange}
      style={{
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Text
        style={{ fontSize: 24, color: colors.action }}
        accessibilityElementsHidden
      >
        {checked ? "◉" : "○"}
      </Text>
      <Label>{label}</Label>
    </Pressable>
  );
}
export function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useDesign();
  return (
    <Stack row>
      <NativeSwitch
        accessibilityLabel={label}
        value={checked}
        onValueChange={onChange}
        trackColor={{ false: colors.muted, true: colors.action }}
        thumbColor={checked ? colors.onAction : colors.surface}
      />
      <Label>{label}</Label>
    </Stack>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Stack style={{ gap: 8 }}>
      <Label variant="secondary">{label}</Label>
      <Button
        variant="secondary"
        label={`${label}: ${options.find((o) => o.value === value)?.label ?? value}`}
        onPress={() => setOpen(true)}
      >
        {options.find((o) => o.value === value)?.label ?? value} ▾
      </Button>
      <BottomSheet open={open} title={label} onClose={() => setOpen(false)}>
        {options.map((o) => (
          <Radio
            key={o.value}
            label={o.label}
            checked={value === o.value}
            onChange={() => {
              onChange(o.value);
              setOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </Stack>
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
  const { colors } = useDesign();
  const bg = tone === "neutral" ? colors.subtle : colors[`${tone}Bg`];
  const fg = tone === "neutral" ? colors.muted : colors[`${tone}Fg`];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        maxWidth: "100%",
        backgroundColor: outline ? colors.surface : bg,
        borderColor: outline ? fg : bg,
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: radii.pill,
      }}
    >
      <Text
        style={{ fontSize: 14, lineHeight: 21, color: fg, fontWeight: "600" }}
      >
        {children}
      </Text>
    </View>
  );
}
export function PaymentSourceBadge({ source }: { source: PaymentSource }) {
  const { t } = useDesign();
  const d = paymentSources[source];
  return (
    <Badge tone={d.tone} outline={d.outline}>
      {d.symbol} {t[d.label]}
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
  const d = paymentStatuses[status];
  return (
    <Stack style={{ gap: 8 }}>
      <Badge tone={d.tone}>{t[d.label]}</Badge>
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
export function Price(props: Money) {
  const { locale } = useDesign();
  return <Label variant="price">{formatMoney(props, locale)}</Label>;
}
export function Currency({ code }: { code: string }) {
  return (
    <Label variant="secondary" muted>
      {code}
    </Label>
  );
}
export function Avatar({ name }: { name: string }) {
  const { colors } = useDesign();
  return (
    <View
      accessible
      accessibilityLabel={name}
      accessibilityRole="image"
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.subtle,
      }}
    >
      <Label>
        {name
          .split(/\s+/)
          .slice(0, 2)
          .map((s) => s[0])
          .join("")}
      </Label>
    </View>
  );
}
export function ProductCard({
  product,
  onOpen,
}: {
  product: ProductPreview;
  onOpen: () => void;
}) {
  const { colors, t } = useDesign();
  return (
    <Card>
      <Stack>
        <View
          style={{
            height: 180,
            backgroundColor: colors.subtle,
            borderRadius: radii.field,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ProductImage
            key={product.image}
            image={product.image}
            title={product.title}
            fallback={t.noImage}
          />
        </View>
        <Label muted variant="secondary">
          {product.shop}
        </Label>
        <Label variant="h3">{product.title}</Label>
        <Price amountMinor={product.amountMinor} currency={product.currency} />
        <Badge
          tone={product.availability === "available" ? "success" : "neutral"}
        >
          {t[product.availability]}
        </Badge>
        <Button variant="secondary" onPress={onOpen}>
          {t.view}
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
        <Label variant="h3">{name}</Label>
        <Label muted>{description}</Label>
        <Button variant="secondary" onPress={onOpen}>
          {t.shop}
        </Button>
      </Stack>
    </Card>
  );
}
export function Loading() {
  const { colors, t } = useDesign();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={t.loading}
      style={{ flexDirection: "row", gap: 12 }}
    >
      <ActivityIndicator color={colors.action} />
      <Label>{t.loading}</Label>
    </View>
  );
}
export function Skeleton() {
  const { colors } = useDesign();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ gap: 12 }}
    >
      {[80, 20, 20].map((height, i) => (
        <View
          key={i}
          style={{
            height,
            width: i === 2 ? "60%" : "100%",
            borderRadius: radii.field,
            backgroundColor: colors.subtle,
          }}
        />
      ))}
    </View>
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
      <Stack>
        <Label variant="h3">{t[kind]}</Label>
        <Label muted>{t[`${kind}Body`]}</Label>
        {onRetry && (
          <Button variant="secondary" onPress={onRetry}>
            {t.retry}
          </Button>
        )}
      </Stack>
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
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const { colors } = useDesign();
  return (
    <View
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        padding: 4,
        backgroundColor: colors.subtle,
        borderRadius: radii.field,
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === item.id }}
          onPress={() => onChange(item.id)}
          style={{
            flexGrow: 1,
            minHeight: 48,
            padding: 12,
            borderRadius: 12,
            backgroundColor: value === item.id ? colors.surface : colors.subtle,
          }}
        >
          <Label>{item.label}</Label>
        </Pressable>
      ))}
    </View>
  );
}
export function BottomNavigation({
  items,
  value,
  onChange,
  label,
}: Parameters<typeof Tabs>[0]) {
  const { colors } = useDesign();
  return (
    <View
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.card,
        backgroundColor: colors.surface,
      }}
    >
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityState={{ selected: value === item.id }}
          onPress={() => onChange(item.id)}
          style={{
            flex: 1,
            minWidth: 64,
            minHeight: 64,
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
          }}
        >
          <Text
            accessibilityElementsHidden
            style={{
              color: value === item.id ? colors.action : colors.muted,
              fontSize: 24,
            }}
          >
            {["◇", "≡", "▢", "○"][index % 4]}
          </Text>
          <Label variant="secondary">{item.label}</Label>
        </Pressable>
      ))}
    </View>
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
    <Image
      source={{ uri: image }}
      accessibilityLabel={title}
      resizeMode="cover"
      style={{ width: "100%", height: "100%", borderRadius: radii.field }}
      onError={() => setFailed(true)}
    />
  ) : (
    <Label muted>{fallback}</Label>
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
    <Stack row style={{ justifyContent: "space-between" }}>
      <Label variant="h3">{title}</Label>
      {children}
    </Stack>
  );
}
export const AppBar = Header;
export function Dialog({
  open,
  title,
  onClose,
  children,
  sheet = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  sheet?: boolean;
}) {
  const { colors, t, reducedMotion } = useDesign();
  return (
    <Modal
      visible={open}
      transparent
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: sheet ? "flex-end" : "center",
          padding: sheet ? 0 : 16,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            maxHeight: "90%",
            backgroundColor: colors.elevated,
            padding: 24,
            borderRadius: radii.section,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Stack>
              <Header title={title}>
                <IconButton label={t.close} icon="×" onPress={onClose} />
              </Header>
              {children}
            </Stack>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  const { t, colors } = useDesign();
  return (
    <View
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: colors.elevated,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.card,
      }}
    >
      <Stack row>
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: colors.text, flex: 1 }}
        >
          {message}
        </Text>
        <IconButton label={t.close} icon="×" onPress={onClose} />
      </Stack>
    </View>
  );
}
export const Snackbar = Toast;
export function MoneySummaryCard({ summary }: { summary: MoneySummary }) {
  const { t } = useDesign();
  return (
    <Card>
      <Stack>
        {(["sold", "received", "outstanding", "refunded"] as const).map(
          (key) => (
            <View key={key}>
              <Label variant="secondary" muted>
                {t[key === "refunded" ? "refundedAmount" : key]}
              </Label>
              <Price amountMinor={summary[key]} currency={summary.currency} />
            </View>
          ),
        )}
      </Stack>
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
  const { colors, t } = useDesign();
  const percent = (100 * received) / Math.max(1, received + outstanding);
  return (
    <Stack>
      <Label>{t.partial}</Label>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={t.partial}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
        style={{
          height: 8,
          backgroundColor: colors.subtle,
          borderRadius: radii.pill,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 8,
            width: `${Math.min(100, Math.max(0, percent))}%`,
            backgroundColor: colors.action,
          }}
        />
      </View>
      <Label muted>{t.received}</Label>
      <Price amountMinor={received} currency={currency} />
      <Label muted>{t.outstanding}</Label>
      <Price amountMinor={outstanding} currency={currency} />
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
    <Stack>
      <Label variant="h3">
        {direction === "in" ? t.entry : t.exit} · {reference}
      </Label>
      <Label muted>
        {t.actor} {actor}
      </Label>
      <PaymentSourceBadge source={source} />
      <Price amountMinor={amountMinor} currency={currency} />
    </Stack>
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
        <Label variant="h3">{t.reconciliation}</Label>
        {[
          { label: t.expected, value: expected },
          { label: t.received, value: confirmed },
          { label: t.difference, value: difference },
        ].map((row) => (
          <View key={row.label}>
            <Label muted>{row.label}</Label>
            <Price amountMinor={row.value} currency={currency} />
          </View>
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
        <Label variant="h3">{t.dayClose}</Label>
        <MoneySummaryCard summary={summary} />
        <TextField label={t.note} value={note} onChangeText={setNote} />
        <Checkbox
          label={t.reviewed}
          checked={reviewed}
          onChange={setReviewed}
        />
        <Button disabled={!reviewed} onPress={() => onCloseDay(note)}>
          {t.closeDay}
        </Button>
      </Stack>
    </Card>
  );
}
