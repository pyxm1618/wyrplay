"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { crossesDocumentBoundary } from "@/platform/advertising/adsense-routes";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
  prefetch?: boolean | null;
};

/** Keep the browser's Document policy and bootstrap in step with the destination. */
export function DocumentBoundaryLink({ href, prefetch, ...props }: Props) {
  const pathname = usePathname();
  if (crossesDocumentBoundary(pathname, href)) return <a href={href} {...props} />;
  return <NextLink href={href} {...(prefetch === undefined ? {} : { prefetch })} {...props} />;
}
