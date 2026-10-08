import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/navigation/site-shell";
import { rootMetadata } from "@/platform/seo/root-metadata";

export const metadata: Metadata = rootMetadata();

export default function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
