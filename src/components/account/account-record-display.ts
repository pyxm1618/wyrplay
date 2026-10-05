import { productDefinitions } from "@/config/products.config";
import type { ProductDefinition } from "@/platform/commerce/domain/product";

const accountDateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatAccountDateTime(date: Date): string {
  return `${accountDateTime.format(date)} UTC`;
}

export function accountProductName(
  product: { key: string; version: number; model: string; billingInterval: string | null },
  definitions: readonly ProductDefinition[] = productDefinitions,
): string {
  const definition = definitions.find(
    (candidate) => candidate.key === product.key && candidate.version === product.version,
  );
  const displayName = definition?.displayName?.trim();
  if (displayName) return displayName;
  if (product.model === "one_time") return "One-time purchase";
  if (product.billingInterval === "month") return "Monthly subscription";
  if (product.billingInterval === "year") return "Annual subscription";
  return "Subscription";
}
