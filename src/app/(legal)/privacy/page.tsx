import type { Metadata } from "next";

import { PrivacyView } from "@/components/legal/privacy-view";
import { legalConfig } from "@/config/legal.config";
import { routeRegistry } from "@/config/routes.config";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export const metadata: Metadata = metadataForRoute(
  routeRegistry,
  "/privacy",
  currentSeoEnvironment(),
);

export default function PrivacyPage() {
  return (
    <PrivacyView
      document={legalConfig.documents.privacy}
      sections={legalConfig.content.privacy}
    />
  );
}
