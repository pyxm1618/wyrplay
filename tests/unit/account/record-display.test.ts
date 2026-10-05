import { describe, expect, it } from "vitest";
import {
  accountProductName,
  formatAccountDateTime,
} from "@/components/account/account-record-display";
import { productDefinitions } from "@/config/products.config";

describe("Account record display", () => {
  it("formats UTC dates without exposing ISO serialization", () => {
    expect(formatAccountDateTime(new Date("2026-10-01T00:00:00Z"))).toBe(
      "Oct 1, 2026, 12:00 AM UTC",
    );
  });
  it("uses the configured name only for the matching product version", () => {
    const definition = { ...productDefinitions[0], displayName: "  Named test purchase  " };
    const product = { key: definition.key, version: 1, model: "one_time", billingInterval: null };
    expect(accountProductName(product, [definition])).toBe("Named test purchase");
    expect(accountProductName({ ...product, version: 2 }, [definition])).toBe("One-time purchase");
  });
  it("describes unnamed products from their actual billing model without deriving names from keys", () => {
    const product = {
      key: "internal-fixture-uuid",
      version: 1,
      model: "subscription",
      billingInterval: "month",
    };
    expect(accountProductName(product, [])).toBe("Monthly subscription");
    expect(accountProductName({ ...product, billingInterval: "year" }, [])).toBe(
      "Annual subscription",
    );
  });
});
