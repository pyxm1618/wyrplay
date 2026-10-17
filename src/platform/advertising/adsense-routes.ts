import { siteConfig } from "@/config/site.config";

const adsenseRoutes = new Set(["/"]);

function normalizedOrigin(value: string | undefined): string | undefined {
  return value?.replace(/\/+$/, "");
}

export function isAdSenseRoute(pathname: string): boolean {
  return adsenseRoutes.has(pathname);
}

export function isAdSenseRuntimeEnabled(): boolean {
  const enabledTestRuntime =
    process.env.APP_ENV === "test" && process.env.CREAT_WEB_E2E_ENABLED_FEATURES === "1";
  if (enabledTestRuntime) return true;

  return (
    process.env.APP_ENV === "production" &&
    normalizedOrigin(process.env.APP_ORIGIN) === normalizedOrigin(siteConfig.canonicalOrigin)
  );
}
