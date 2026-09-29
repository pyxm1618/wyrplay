import type { CreditOrderFulfillmentDefinition } from "@/platform/credits/integration/commerce/credit-fulfillment";

export const creditFulfillmentDefinitions = [
  {
    fulfillmentKey: "overlap-pro-unlock",
    creditType: "overlap-lookup",
    quantity: 100,
    expiresAfterDays: 365,
  },
] as const satisfies readonly CreditOrderFulfillmentDefinition[];
