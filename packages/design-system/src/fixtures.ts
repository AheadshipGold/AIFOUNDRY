import { MoneySummary, ProductPreview } from "./presentation";
import { Locale } from "./tokens";
import { messages } from "./messages";
// Gallery-only fixtures. Never import into a production repository/service.
export const exampleSummary: MoneySummary = {
  currency: "XOF",
  sold: 500000,
  received: 200000,
  outstanding: 300000,
  refunded: 0,
};
export function exampleProduct(locale: Locale): ProductPreview {
  const t = messages[locale];
  return {
    id: "demo-notebook",
    title: t.sampleProduct,
    shop: t.sampleShop,
    amountMinor: 4500,
    currency: "XOF",
    availability: "available",
  };
}
