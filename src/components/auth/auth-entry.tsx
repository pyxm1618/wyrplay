import { featuresConfig } from "@/config/features.config";
import { env } from "@/platform/config/env";
import { SignInForm } from "./auth-form";
import { AuthSurface } from "./auth-surface";

export function AuthEntry({
  mode,
  error,
}: Readonly<{ mode: "login" | "signup"; error?: "google" | "magic-link" | undefined }>) {
  return (
    <AuthSurface mode={mode}>
      <SignInForm
        turnstileSiteKey={env.turnstileSiteKey}
        magicLinkEnabled={featuresConfig.auth.magicLink}
        googleEnabled={Boolean(
          featuresConfig.auth.google && env.googleClientId && env.googleClientSecret,
        )}
        signup={mode === "signup"}
        error={error}
      />
    </AuthSurface>
  );
}
