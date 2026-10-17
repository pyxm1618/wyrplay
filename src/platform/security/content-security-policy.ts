export type ContentSecurityPolicyInput = Readonly<{
  nonce?: string | undefined;
  hashes?: readonly string[] | undefined;
  development: boolean;
  production: boolean;
  analytics: Readonly<{ ga4: boolean; clarity: boolean }>;
  turnstile: boolean;
  adsense?: boolean;
}>;

export function buildContentSecurityPolicy(input: ContentSecurityPolicyInput): string {
  if (input.nonce !== undefined && !input.nonce.trim()) {
    throw new Error("CSP nonce must not be empty");
  }
  if (input.adsense && !input.nonce) {
    throw new Error("AdSense strict CSP requires a nonce");
  }

  const turnstileOrigin = "https://challenges.cloudflare.com";
  const scriptSources = input.adsense
    ? [
        "'self'",
        `'nonce-${input.nonce}'`,
        "'unsafe-inline'",
        "'unsafe-eval'",
        "'strict-dynamic'",
        "https:",
        "http:",
      ]
    : [
        "'self'",
        ...(input.nonce ? [`'nonce-${input.nonce}'`] : []),
        ...(input.hashes && input.hashes.length > 0
          ? input.hashes.map((hash) => `'sha256-${hash}'`)
          : []),
        ...(input.development ? ["'unsafe-eval'"] : []),
        ...(input.analytics.ga4 ? ["https://www.googletagmanager.com"] : []),
        ...(input.analytics.clarity ? ["https://www.clarity.ms"] : []),
        ...(input.turnstile ? [turnstileOrigin] : []),
      ];
  const styleSources = ["'self'", "'unsafe-inline'", ...(input.adsense ? ["https:"] : [])];
  const connectSources = input.adsense
    ? ["'self'", "https:"]
    : [
        "'self'",
        "https://media.wyrplay.com",
        ...(input.analytics.ga4
          ? ["https://www.google-analytics.com", "https://region1.google-analytics.com"]
          : []),
        ...(input.analytics.clarity ? ["https://*.clarity.ms"] : []),
        ...(input.turnstile ? [turnstileOrigin] : []),
      ];
  const imageSources = input.adsense
    ? ["'self'", "https:", "data:", "blob:"]
    : [
        "'self'",
        "https://media.wyrplay.com",
        "data:",
        "blob:",
        ...(input.analytics.ga4 ? ["https://www.google-analytics.com"] : []),
        ...(input.analytics.clarity ? ["https://*.clarity.ms"] : []),
      ];
  const fontSources = ["'self'", "data:", ...(input.adsense ? ["https:"] : [])];
  const frameSources = input.adsense
    ? ["'self'", "https:"]
    : ["'self'", ...(input.turnstile ? [turnstileOrigin] : [])];
  const workerSources = ["'self'", "blob:", ...(input.adsense ? ["https:"] : [])];

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src ${styleSources.join(" ")}`,
    `img-src ${imageSources.join(" ")}`,
    `font-src ${fontSources.join(" ")}`,
    `connect-src ${connectSources.join(" ")}`,
    `frame-src ${frameSources.join(" ")}`,
    "object-src 'none'",
    input.adsense ? "base-uri 'none'" : "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `worker-src ${workerSources.join(" ")}`,
    ...(input.production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
