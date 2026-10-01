import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/account/account-settings";
import { featuresConfig } from "@/config/features.config";
import { getAccountContext } from "@/platform/auth/account-context";
import { getAuth } from "@/platform/auth/auth";
import { signOutAction } from "../security/actions";
export default async function Page() {
  const h = await headers();
  const context = await getAccountContext(h);
  if (!context) redirect("/sign-in");
  const auth = getAuth();
  if (!auth) redirect("/sign-in");
  let sessionCount: number | null = null;
  try {
    sessionCount = (await auth.api.listSessions({ headers: h })).length;
  } catch (error) {
    if (!isAPIError(error) || error.body?.code !== "SESSION_NOT_FRESH") throw error;
  }
  return (
    <AccountSettings
      profile={{
        name: context.user.name,
        email: context.user.email,
        image: context.user.image ?? null,
        joined: new Intl.DateTimeFormat("en", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(context.user.createdAt),
      }}
      commerceEnabled={featuresConfig.commerce.enabled}
      verified={context.user.emailVerified}
      sessionCount={sessionCount}
      magicLinkEnabled={featuresConfig.auth.magicLink}
      signOutAction={signOutAction}
    />
  );
}
