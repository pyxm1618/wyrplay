import type { Metadata } from "next";
import { printConfig } from "@/config/play.config";
import { routeRegistry } from "@/config/routes.config";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import "./print.css";

export const metadata: Metadata = metadataForRoute(
  routeRegistry,
  "/print",
  currentSeoEnvironment(),
);

export default function Page() {
  return <main>{printConfig.surface}</main>;
}
