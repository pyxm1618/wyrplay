import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountOverview } from "@/components/account/account-overview";
import { featuresConfig } from "@/config/features.config";
import { getLeaderboardSnapshot } from "@/modules/would-you-rather/server";
import type { LeaderboardResult } from "@/modules/would-you-rather";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather";
import { getAccountContext } from "@/platform/auth/account-context";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const view = (await searchParams).view;
  const context = await getAccountContext(await headers());
  if (!context) redirect("/sign-in");
  const joined = new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(context.user.createdAt));
  let votes: LeaderboardResult;
  try {
    votes = { status: "ready", snapshot: await getLeaderboardSnapshot() };
  } catch {
    votes = { status: "unavailable" };
  }
  return (
    <AccountOverview
      profile={{
        name: context.user.name,
        email: context.user.email,
        image: context.user.image ?? null,
        joined,
      }}
      questions={QUESTIONS_DATABASE.filter((question) => question.reviewStatus === "approved")}
      votes={votes}
      initialTab={
        view === "saved"
          ? "Saved Questions"
          : view === "my"
            ? "My Questions"
            : view === "activity"
              ? "Recent Activity"
              : "Overview"
      }
      commerceEnabled={featuresConfig.commerce.enabled}
    />
  );
}
