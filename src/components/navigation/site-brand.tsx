import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site.config";

export function SiteBrand({
  href = "/",
  className = "",
}: Readonly<{
  href?: string;
  className?: string;
}>) {
  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} Home`}
      className={`inline-flex items-center gap-3 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90 ${className}`}
    >
      <Image
        src="/brand/logo.svg"
        alt=""
        width={40}
        height={40}
        className="size-10 object-contain"
        priority
      />
      <span className="font-serif text-lg tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}
