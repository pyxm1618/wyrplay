import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import { accountProfile } from "@/components/account/account-profile";
import { featuresConfig } from "@/config/features.config";
import { AccountShell } from "@/components/account/account-shell";
import { bodyText, inlineLink, panel } from "@/components/ui/styles";
import { getAccountContext } from "@/platform/auth/account-context";
import { db } from "@/platform/database/application-database";
import { orders } from "@/platform/database/commerce-schema";

export default async function CheckoutReturnPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const context = await getAccountContext(await headers());
  if (!context) redirect("/sign-in");
  const params = await searchParams;
  const orderId = typeof params.order === "string" ? params.order : "";

  const order = z.uuid().safeParse(orderId).success
    ? await db.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.subjectId, context.subject.id)),
      })
    : null;

  return (
    <AccountShell
      profile={accountProfile(context.user)}
      commerceEnabled={featuresConfig.commerce.enabled}
      eyebrow="Payment return"
      title="Payment status"
      titleId="checkout-return-title"
    >
      {order ? (
        <>
          <div className={`${panel} p-5`}>
            <p className={bodyText}>
              Current server-recorded status:{" "}
              <strong className="font-semibold text-foreground">{order.status}</strong>
            </p>
          </div>
          <p className={`mt-4 ${bodyText}`}>
            Browser return parameters are advisory only. A payment becomes successful only after a
            verified provider event or reconciliation updates the server ledger.
          </p>
        </>
      ) : (
        <p className={bodyText}>The requested order was not found for this account.</p>
      )}
      <p className="mt-6">
        <Link href="/account/billing" className={inlineLink}>
          View billing history
        </Link>
      </p>
    </AccountShell>
  );
}
