import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import {
  bodyText,
  containerNarrow,
  eyebrow,
  inlineLink,
  pageTitle,
  subTitle,
} from "@/components/ui/styles";
import { legalConfig } from "@/config/legal.config";
import { routeRegistry } from "@/config/routes.config";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export const metadata: Metadata = metadataForRoute(
  routeRegistry,
  "/contact",
  currentSeoEnvironment(),
);

const supportEmail = legalConfig.operator.supportEmail;

export default function ContactPage() {
  return (
    <main className={`${containerNarrow} py-14 sm:py-20`}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <p className={`mt-8 ${eyebrow}`}>Contact WYRPlay</p>
      <h1 className={`mt-3 ${pageTitle}`}>Contact</h1>
      <p className={`mt-4 ${bodyText}`}>
        For questions about WYRPlay, privacy, billing, account deletion, safety, or legal matters,
        email us at{" "}
        <a href={`mailto:${supportEmail}`} className={inlineLink}>
          {supportEmail}
        </a>
        .
      </p>

      <section className="mt-10" aria-labelledby="general-support">
        <h2 id="general-support" className={subTitle}>
          General support and feedback
        </h2>
        <p className={`mt-3 ${bodyText}`}>
          Contact us about question content, site functionality, accessibility, feedback, or other
          general product issues. Include the page or feature involved and enough detail for us to
          understand the problem.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy-requests">
        <h2 id="privacy-requests" className={subTitle}>
          Privacy requests
        </h2>
        <p className={`mt-3 ${bodyText}`}>
          Use the same email address for access, correction, deletion, or other privacy requests. If
          the request concerns an account, contact us from the account email address when possible.
          We may ask for reasonable verification before disclosing or deleting account-linked
          information.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="billing-support">
        <h2 id="billing-support" className={subTitle}>
          Billing, subscriptions, and refunds
        </h2>
        <p className={`mt-3 ${bodyText}`}>
          For questions regarding subscriptions, billing, or eligible refund requests under our
          Refund and Cancellation Policy, email us at{" "}
          <a href={`mailto:${supportEmail}`} className={inlineLink}>
            {supportEmail}
          </a>{" "}
          with your registered account email, approximate transaction date, amount, and a short
          description. Do not send full payment-card numbers or security codes by email.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="account-deletion">
        <h2 id="account-deletion" className={subTitle}>
          Account deletion
        </h2>
        <p className={`mt-3 ${bodyText}`}>
          To delete your account, use the Delete Account control in Account Settings. If you cannot
          access your account, email us at{" "}
          <a href={`mailto:${supportEmail}`} className={inlineLink}>
            {supportEmail}
          </a>{" "}
          from your account email address requesting deletion.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="safety-security">
        <h2 id="safety-security" className={subTitle}>
          Safety, abuse, and security
        </h2>
        <p className={`mt-3 ${bodyText}`}>
          Report child-safety concerns, abusive or illegal content, account abuse, vote
          manipulation, or suspected security problems with enough detail for us to investigate. Do
          not include unnecessary personal information in the report.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="copyright-legal">
        <h2 id="copyright-legal" className={subTitle}>
          Copyright and legal notices
        </h2>
        <p className={`mt-3 ${bodyText}`}>
          Send copyright concerns, legal notices, or requests from authorized government or law
          enforcement personnel to{" "}
          <a href={`mailto:${supportEmail}`} className={inlineLink}>
            {supportEmail}
          </a>
          . Include the relevant URLs, the basis for the request, and reliable contact information.
        </p>
      </section>
    </main>
  );
}
