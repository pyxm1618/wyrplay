import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { featuresConfig } from "@/config/features.config";
import { rootMetadata } from "@/platform/seo/root-metadata";

export const metadata: Metadata = {
  ...rootMetadata(),
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  if (!featuresConfig.auth.enabled) notFound();
  return <>{children}</>;
}
