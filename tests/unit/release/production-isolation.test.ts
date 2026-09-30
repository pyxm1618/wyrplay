import { describe, expect, it } from "vitest";

import { featuresConfig } from "@/config/features.config";
import { legalConfig } from "@/config/legal.config";
import { routeDefinitions } from "@/config/routes.config";
import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";

describe("Production Boundaries & Invariants Gate", () => {
  it("enforces no-auth and no-commerce configuration for WYRPlay", () => {
    // WYRPlay 生产免登录无账户、免付费，相关特性必须关闭
    expect(featuresConfig.auth.enabled).toBe(false);
    expect(featuresConfig.commerce.enabled).toBe(false);
    expect(legalConfig.authMethods).toEqual([]);
  });

  it("preserves Owner / Legal review boundaries (does not falsely mark reviewed)", () => {
    // 保护边界：绝不擅自修改 minimumAge = 13
    expect(legalConfig.minimumAge).toBe(13);

    // 保护边界：绝不伪造 Legal 审校状态为 reviewed
    expect(legalConfig.releaseStatus).toBe("draft");
    expect(legalConfig.documents.privacy.reviewStatus).toBe("draft");
    expect(legalConfig.documents.terms.reviewStatus).toBe("draft");
    expect(legalConfig.documents.acceptable_use.reviewStatus).toBe("draft");
  });

  it("registers all system routes in routeDefinitions", () => {
    const registeredPaths = routeDefinitions.map((r) => r.route);
    expect(registeredPaths).toContain("/api/wyr/vote");
    expect(registeredPaths).toContain("/api/internal/seo/indexnow");
    expect(registeredPaths).toContain("/indexnow-key.txt");
  });

  it("enforces official brand unified as WYRPlay while keeping SEO keywords separate", () => {
    // 正式品牌统一为 WYRPlay
    expect(siteConfig.name).toBe("WYRPlay");
    expect(seoConfig.siteName).toBe("WYRPlay");

    // 保护边界：SEO 核心关键词与标题继续保持 keyword-first
    expect(seoConfig.defaultTitle).toBe("Would You Rather Questions");
  });
});
