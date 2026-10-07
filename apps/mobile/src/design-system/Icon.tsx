// Ojarket Luxury Phosphor Icon Component
// System-wide standard using Phosphor Icons with duotone luxury rendering

import React from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import * as Phosphor from "phosphor-react-native";
import { useDesign } from "./provider";

export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: IconWeight;
}

// Master icon translation dictionary: maps names to Phosphor component names
const ICON_MAP: Record<string, keyof typeof Phosphor> = {
  // Navigation & Core
  home: "House",
  search: "MagnifyingGlass",
  magnify: "MagnifyingGlass",
  cart: "ShoppingBag",
  "bag-handle": "ShoppingBagOpen",
  bag: "Tote",
  user: "User",
  profile: "UserCircle",
  settings: "GearSix",
  gear: "GearSix",
  bell: "Bell",
  notifications: "BellRinging",
  menu: "List",
  close: "X",
  x: "X",
  check: "Check",
  "check-circle": "CheckCircle",
  plus: "Plus",
  minus: "Minus",
  trash: "Trash",
  edit: "PencilSimple",
  pencil: "PencilSimple",
  filter: "Funnel",
  share: "ShareNetwork",
  copy: "Copy",
  info: "Info",
  warning: "WarningCircle",
  help: "Question",
  lock: "LockKey",
  globe: "Globe",
  sun: "Sun",
  moon: "Moon",
  eye: "Eye",
  "eye-slash": "EyeSlash",

  // Arrows & Carets
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight",
  "arrow-up": "ArrowUp",
  "arrow-down": "ArrowDown",
  "caret-left": "CaretLeft",
  "caret-right": "CaretRight",
  "caret-down": "CaretDown",
  "caret-up": "CaretUp",
  "chevron-left": "CaretLeft",
  "chevron-right": "CaretRight",
  "chevron-down": "CaretDown",
  "chevron-up": "CaretUp",
  refresh: "ArrowsClockwise",

  // Luxury & Marketplace Categories
  crown: "Crown",
  diamond: "Diamond",
  gem: "Sparkle",
  sparkle: "Sparkle",
  sparkles: "Sparkle",
  star: "Star",
  heart: "Heart",
  watch: "Watch",
  clock: "Clock",
  art: "Palette",
  palette: "Palette",
  atelier: "Hammer",
  workshop: "Hammer",
  store: "Storefront",
  storefront: "Storefront",
  armchair: "Armchair",
  house: "House",
  tote: "Tote",
  dress: "CoatHanger",
  shoes: "Sneaker",
  digital: "Cpu",
  cube: "Cube",
  certificate: "Certificate",
  shield: "ShieldCheck",
  verified: "SealCheck",
  "seal-check": "SealCheck",

  // Finance & Payment
  money: "Coins",
  coins: "Coins",
  wallet: "Wallet",
  cash: "Money",
  card: "CreditCard",
  "credit-card": "CreditCard",
  receipt: "Receipt",
  bank: "Bank",
  invoice: "Scroll",

  // Orders & Logistics
  package: "Package",
  truck: "Truck",
  map: "MapPin",
  "map-pin": "MapPin",
  navigation: "NavigationArrow",
  phone: "Phone",
  chat: "ChatCircleDots",
  message: "ChatCircleText",
  send: "PaperPlaneRight",
  download: "DownloadSimple",
  upload: "UploadSimple",
  camera: "Camera",
  image: "Image",
  file: "FileText",
  "file-text": "FileText",
  requests: "FileText",
  purchases: "ShoppingBagOpen",
  dashboard: "ChartBar",
  orders: "Package",
  cashbook: "Wallet",

  // Auth & Brands
  google: "GoogleLogo",
  apple: "AppleLogo",
  logout: "SignOut",
  login: "SignIn",
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color,
  style,
  weight = "duotone", // Enforced luxury standard default
}) => {
  const { colors } = useDesign();
  const iconColor = color || colors.text;

  const normalized = String(name).toLowerCase().replace(/_/g, "-");
  const phosphorKey = ICON_MAP[normalized] || (name in Phosphor ? (name as keyof typeof Phosphor) : null);

  const Component = phosphorKey
    ? ((Phosphor as any)[phosphorKey] || (Phosphor as any).default?.[phosphorKey])
    : null;

  if (!Component) {
    const Fallback = (Phosphor as any).Question || (Phosphor as any).default?.Question;
    if (!Fallback) return null;
    return <Fallback size={size} color={iconColor} weight={weight} style={[styles.icon, style]} />;
  }

  return <Component size={size} color={iconColor} weight={weight} style={[styles.icon, style]} />;
};

const styles = StyleSheet.create({
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Icon;
