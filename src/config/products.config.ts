import { createProductCatalog } from "@/platform/commerce/application/product-catalog";
import type { ProductDefinition } from "@/platform/commerce/domain/product";

export const productDefinitions = [
  {
    key: "overlap-pro",
    version: 1,
    enabled: true,
    commercialModel: "one_time",
    currency: "USD",
    expectedPrice: "1.88",
    providerProductIdByEnvironment: { test: "PROD_1GlWVC5QcIQMkr8ggWh9eK" },
    fulfillmentKey: "overlap-pro-unlock",
    refundPolicyKey: "standard",
  },
] as const satisfies readonly ProductDefinition[];

export const productCatalog = createProductCatalog(productDefinitions);
