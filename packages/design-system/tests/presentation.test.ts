import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatMoney,
  parsePreferences,
  resolveTheme,
  paymentSources,
  paymentStatuses,
  palette,
  messages,
} from "../src";

test("money respects minor-unit exponents and locale", () => {
  assert.match(
    formatMoney({ amountMinor: 500000, currency: "XOF" }, "en"),
    /500,000/,
  );
  assert.match(
    formatMoney({ amountMinor: 1234, currency: "EUR" }, "en"),
    /12\.34/,
  );
  assert.match(
    formatMoney({ amountMinor: 1234, currency: "EUR" }, "fr"),
    /12,34/,
  );
  assert.match(
    formatMoney({ amountMinor: 1234, currency: "KWD" }, "en"),
    /1\.234/,
  );
  assert.throws(
    () => formatMoney({ amountMinor: 1.2, currency: "XOF" }, "fr"),
    RangeError,
  );
  assert.throws(
    () => formatMoney({ amountMinor: 100, currency: "xof" }, "fr"),
    RangeError,
  );
});
test("provider verification is distinct from seller confirmation", () => {
  assert.notEqual(
    paymentSources.PROVIDER.label,
    paymentSources.SELLER_MANUAL.label,
  );
  assert.notEqual(
    paymentSources.PROVIDER.tone,
    paymentSources.SELLER_MANUAL.tone,
  );
  assert.notEqual(
    paymentSources.PROVIDER.outline,
    paymentSources.SELLER_MANUAL.outline,
  );
  assert.equal(paymentStatuses.DECLARED.tone, "pending");
  assert.equal(paymentStatuses.REFUND_PENDING.tone, "pending");
  assert.equal(paymentStatuses.CONFIRMED.tone, "neutral");
});
test("preferences safely recover and system theme follows the OS", () => {
  assert.deepEqual(parsePreferences("{broken"), {
    locale: "fr",
    mode: "system",
  });
  assert.deepEqual(parsePreferences('{"locale":"en","mode":"dark"}'), {
    locale: "en",
    mode: "dark",
  });
  assert.deepEqual(parsePreferences('{"locale":"xx","mode":"xx"}'), {
    locale: "fr",
    mode: "system",
  });
  assert.equal(resolveTheme("system", "dark"), "dark");
  assert.equal(resolveTheme("light", "dark"), "light");
});
test("both locales and themes have matching complete keys", () => {
  assert.deepEqual(
    Object.keys(messages.fr).sort(),
    Object.keys(messages.en).sort(),
  );
  assert.deepEqual(
    Object.keys(palette.light).sort(),
    Object.keys(palette.dark).sort(),
  );
  for (const dictionary of Object.values(messages))
    for (const value of Object.values(dictionary)) assert.ok(value.trim());
});
function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
test("approved informative foreground/background pairs meet AA", () => {
  for (const colors of Object.values(palette)) {
    for (const [fg, bg] of [
      ["text", "canvas"],
      ["muted", "surface"],
      ["onAction", "action"],
      ["successFg", "successBg"],
      ["pendingFg", "pendingBg"],
      ["errorFg", "errorBg"],
    ] as const) {
      const a = luminance(colors[fg]),
        b = luminance(colors[bg]);
      assert.ok(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
        `${fg}/${bg}`,
      );
    }
  }
});
