export type ContentSecurityPolicyInput = Readonly<{
  nonce?: string | undefined;
  hashes?: readonly string[] | undefined;
  development: boolean;
  production: boolean;
  analytics: Readonly<{ ga4: boolean; clarity: boolean }>;
  turnstile: boolean;
}>;

export function buildContentSecurityPolicy(input: ContentSecurityPolicyInput): string {
  if (input.nonce !== undefined && !input.nonce.trim()) {
    throw new Error("CSP nonce must not be empty");
  }

  const turnstileOrigin = "https://challenges.cloudflare.com";
  const scriptSources = [
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
  const connectSources = [
    "'self'",
    ...(input.analytics.ga4
      ? ["https://www.google-analytics.com", "https://region1.google-analytics.com"]
      : []),
    ...(input.analytics.clarity ? ["https://*.clarity.ms"] : []),
    ...(input.turnstile ? [turnstileOrigin] : []),
  ];
  const imageSources = [
    "'self'",
    "data:",
    "blob:",
    ...(input.analytics.ga4 ? ["https://www.google-analytics.com"] : []),
    ...(input.analytics.clarity ? ["https://*.clarity.ms"] : []),
  ];
  const frameSources = ["'self'", ...(input.turnstile ? [turnstileOrigin] : [])];

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    `frame-src ${frameSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    ...(input.production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
