import { featuresConfig } from "@/config/features.config";
import { env } from "@/platform/config/env";

import { AnalyticsClient } from "./analytics-client";

export function AnalyticsBoundary({ clarity = true }: Readonly<{ clarity?: boolean }>) {
  if (!featuresConfig.analytics.enabled) return null;

  return (
    <AnalyticsClient
      consentRequired={featuresConfig.analytics.consentRequired}
      {...(featuresConfig.analytics.ga4 && env.ga4MeasurementId
        ? { ga4MeasurementId: env.ga4MeasurementId }
        : {})}
      {...(featuresConfig.analytics.clarity && clarity && env.clarityProjectId
        ? { clarityProjectId: env.clarityProjectId }
        : {})}
    />
  );
}
