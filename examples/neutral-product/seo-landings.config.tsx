import type { LandingSection } from "@/components/landing/landing-page";

export type SeoLandingConfig = {
  readonly route: string;
  readonly sections: readonly LandingSection[];
};

export const seoLandingPages: readonly SeoLandingConfig[] = [];

export function seoLandingForRoute(_route: string): SeoLandingConfig | undefined {
  return undefined;
}
