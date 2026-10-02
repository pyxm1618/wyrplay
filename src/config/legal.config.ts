import type { LegalConfig } from "@/platform/legal/types";

export const legalConfig = {
  releaseStatus: "draft",
  operator: {
    legalName: "WYRPlay",
    jurisdiction: "United States",
    supportEmail: "support@wyrplay.com",
  },
  minimumAge: 13,
  dataCategories: [
    "anonymous voting and gameplay interaction data",
    "account and authentication information when account features are enabled",
    "user-submitted content and saved preferences when those features are enabled",
    "technical, security, fraud-prevention, and diagnostic information",
    "support communications and requests",
    "transaction, subscription, refund, and entitlement records when paid features are enabled",
    "optional analytics information when analytics is enabled and the user has provided any required consent",
  ],
  authMethods: [],
  processors: [
    {
      name: "Resend",
      purpose: "Transactional email delivery when account or email features are enabled",
      privacyUrl: "https://resend.com/legal/privacy-policy",
    },
    {
      name: "Google Analytics",
      purpose: "Optional first-party site analytics when analytics is enabled and consent is granted",
      privacyUrl: "https://policies.google.com/privacy",
    },
    {
      name: "Microsoft Clarity",
      purpose:
        "Optional site experience analytics when Clarity is enabled and consent is granted",
      privacyUrl: "https://privacy.microsoft.com/en-us/privacystatement",
    },
    {
      name: "Cloudflare Turnstile",
      purpose: "Abuse and automated-traffic prevention when a Turnstile challenge is presented",
      privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    },
    {
      name: "Waffo",
      purpose:
        "Payment, subscription, and refund processing when paid commerce features are enabled",
    },
  ],
  paymentModel: "none",
  oneTimePurchases: false,
  subscriptions: false,
  credits: false,
  refundPolicy: {
    summary:
      "At the effective date, WYRPlay's public service does not offer paid purchases or subscriptions. If paid features are introduced, the price, billing cadence, renewal terms, and any transaction-specific refund terms will be disclosed before purchase, and this policy will be updated before those features are enabled.",
    cancellationSummary:
      "There are currently no recurring consumer charges to cancel. If subscriptions are introduced, users will receive a clear online cancellation method and material renewal terms before enrollment.",
  },
  subscriptionTerms: null,
  retentionRules: [
    {
      category: "anonymous voting and gameplay records",
      period:
        "for as long as reasonably necessary to operate aggregate results, maintain service integrity, and prevent duplicate or abusive submissions",
      basis: "product operation, fraud prevention, and service integrity",
    },
    {
      category: "account and authentication records",
      period:
        "while an account is active and through the account-deletion workflow, except for limited records that must be retained for security, fraud prevention, dispute resolution, or legal obligations",
      basis: "account operation, security, and legal compliance",
    },
    {
      category: "security and diagnostic records",
      period:
        "for a limited period appropriate to the security, reliability, investigation, or debugging purpose for which the record was created",
      basis: "security, abuse prevention, reliability, and debugging",
    },
    {
      category: "analytics data",
      period:
        "according to the configured retention period of the applicable analytics provider and only while that analytics feature is enabled and permitted",
      basis: "site measurement and product improvement",
    },
    {
      category: "transaction, subscription, refund, and accounting records",
      period:
        "for the period reasonably necessary for payment reconciliation, tax and accounting obligations, chargebacks, fraud prevention, disputes, and other legal requirements",
      basis: "commerce administration and legal compliance",
    },
    {
      category: "support communications",
      period:
        "for as long as reasonably necessary to resolve the request, maintain support history, prevent abuse, or satisfy legal obligations",
      basis: "customer support, security, and legal compliance",
    },
  ],
  accountDeletion: {
    enabled: false,
    summary:
      "If account features are enabled, authenticated users can request deletion from account settings. The deletion workflow revokes account access, prepares any dependent subscription cancellation, removes the authentication identity and account-scoped product data where deletion is appropriate, and may retain limited transaction, security, fraud-prevention, or legal records when required.",
  },
  internationalTransfers:
    "WYRPlay is intended primarily for users in the United States. Service providers may process data in the United States or other locations where they operate. When applicable law requires safeguards for a transfer, WYRPlay will use an appropriate legal mechanism.",
  documents: {
    privacy: { version: "draft-2", effectiveDate: "2026-10-02", reviewStatus: "draft" },
    terms: { version: "draft-2", effectiveDate: "2026-10-02", reviewStatus: "draft" },
    acceptable_use: { version: "draft-2", effectiveDate: "2026-10-02", reviewStatus: "draft" },
    refund_policy: { version: "draft-2", effectiveDate: "2026-10-02", reviewStatus: "draft" },
    account_deletion: { version: "draft-2", effectiveDate: "2026-10-02", reviewStatus: "draft" },
  },
  content: {
    privacy: [
      {
        heading: "Who We Are and Scope",
        paragraphs: [
          "WYRPlay is the Would You Rather service available at www.wyrplay.com. This Privacy Notice explains how WYRPlay handles information when you browse questions, vote, use interactive features, contact support, and, when available, use account or paid features.",
          "This notice is written primarily for users in the United States. Some rights described below apply only when a particular state privacy law applies to WYRPlay and to the person making the request.",
        ],
      },
      {
        heading: "Audience and Age Rules",
        paragraphs: [
          "Public question content may be used by families, educators, teens, adults, and children with appropriate adult supervision. Account registration, content submission tied to an account, purchases, and other features that require personal information are intended for users age 13 or older.",
          "If you are under 13, do not create an account, submit personal information through account features, or make a purchase. A parent, teacher, or other responsible adult may use WYRPlay with a child and may contact us about privacy questions at support@wyrplay.com.",
          "If we learn that personal information was collected from a child under 13 in a way that requires parental notice or consent under the Children's Online Privacy Protection Act, we will take appropriate steps to delete the information or otherwise comply with the law.",
        ],
      },
      {
        heading: "Information You Provide",
        paragraphs: [
          "Depending on which features are enabled, you may provide an email address for sign-in or transactional messages, account preferences, content you choose to create or save, support messages, refund reasons, or other information you submit directly to WYRPlay.",
          "When paid features are enabled, WYRPlay may receive transaction metadata such as the product purchased, amount, currency, subscription status, payment status, and refund status. Payment-card credentials are processed by the payment provider; WYRPlay is not designed to store complete payment-card numbers.",
        ],
      },
      {
        heading: "Gameplay, Voting, and Anonymous Identifiers",
        paragraphs: [
          "WYRPlay may record question interactions, A-or-B votes, timestamps, aggregate vote counts, and similar gameplay information needed to operate the service.",
          "Anonymous voting may use a first-party HttpOnly cookie or another first-party identifier to associate a browser with a vote, preserve vote integrity, and reduce duplicate or abusive submissions. This identifier is used for service operation rather than cross-site advertising.",
        ],
      },
      {
        heading: "Technical and Security Information",
        paragraphs: [
          "Our systems and infrastructure providers may process network and technical information such as IP address, browser or device information, request metadata, timestamps, authentication events, error records, and security signals. We use this information to deliver the site, keep it reliable, investigate abuse, enforce rate limits, and protect WYRPlay and its users.",
          "When an anti-abuse challenge such as Cloudflare Turnstile is presented, the provider may process technical information needed to distinguish legitimate users from automated or abusive traffic.",
        ],
      },
      {
        heading: "Cookies, Local Storage, and Similar Technologies",
        paragraphs: [
          "WYRPlay uses first-party storage when it is reasonably necessary to provide requested functionality, preserve preferences, support authentication or security, maintain vote integrity, or remember a privacy choice.",
          "Optional analytics technologies are not required for core gameplay. Where WYRPlay presents an analytics-consent choice, analytics scripts are loaded only after the required choice is granted, and users can later withdraw that choice through the available privacy settings.",
        ],
      },
      {
        heading: "Optional Analytics",
        paragraphs: [
          "When enabled, WYRPlay may use Google Analytics and Microsoft Clarity to understand page usage, feature engagement, performance, and usability. WYRPlay's analytics implementation is designed to avoid sending email-like values, arbitrary query strings, or other unnecessary user-entered content as analytics event properties.",
          "Where consent is required by our configuration or applicable law, these analytics tools are not activated until consent is granted. If analytics is disabled for the service, these providers do not receive data from WYRPlay through those analytics integrations.",
        ],
      },
      {
        heading: "How We Use Information",
        paragraphs: [
          "We use information to provide and secure WYRPlay, authenticate users when account features are enabled, record and aggregate gameplay, save user-requested state, respond to support requests, process purchases or refunds when commerce is enabled, send transactional communications, prevent fraud and abuse, diagnose problems, measure site performance, and comply with legal obligations.",
          "We seek to collect and use information only for purposes that are reasonably necessary and proportionate to the feature or legal obligation involved.",
        ],
      },
      {
        heading: "How We Disclose Information",
        paragraphs: [
          "We may disclose information to service providers that perform functions on our behalf, such as hosting, database services, email delivery, authentication, security, analytics, and payment processing. Providers receive only the information reasonably needed for the relevant service and are subject to their own contractual and legal obligations.",
          "We may also disclose information when reasonably necessary to comply with law, respond to valid legal process, protect users or the public, investigate fraud or abuse, enforce our terms, or protect the rights and security of WYRPlay.",
          "WYRPlay does not currently sell personal information for money or use personal information for cross-context behavioral advertising. If those practices change, we will update this notice and provide any choices required by applicable law before the new practice applies.",
        ],
      },
      {
        heading: "Children's Privacy",
        paragraphs: [
          "Some WYRPlay content, including the Kids collection, is designed to be useful to families and educators and may appeal to children. We therefore treat children's privacy as a separate product requirement rather than relying only on a general age statement.",
          "WYRPlay does not knowingly permit children under 13 to create accounts, submit personal information through account features, or purchase paid features without a legally sufficient parental process. We do not use personal information from children under 13 for targeted advertising or behavioral profiling.",
          "On child-directed portions of the service, persistent identifiers should be limited to uses that are permitted without parental consent, such as functions reasonably necessary for internal operations, security, fraud prevention, basic preferences, or service analytics that qualifies for that exception. If WYRPlay later introduces a feature that requires collecting personal information from a child under 13 outside an applicable exception, parental notice and verifiable parental consent must be implemented before that collection begins.",
        ],
      },
      {
        heading: "Data Retention",
        paragraphs: [
          "We keep information only for as long as reasonably necessary for the purpose for which it was collected, including operating the service, maintaining security and vote integrity, resolving support requests, administering transactions, meeting tax or accounting obligations, handling disputes, and complying with law.",
          "Retention periods vary by data type. Account information is generally kept while an account is active and through the deletion workflow. Security and diagnostic records are kept for limited operational periods. Commerce records may be retained longer where needed for accounting, chargebacks, fraud prevention, disputes, or legal obligations. Data that has been irreversibly de-identified or aggregated may be retained because it no longer reasonably identifies an individual.",
        ],
      },
      {
        heading: "Your Choices and Privacy Rights",
        paragraphs: [
          "You can decline or withdraw optional analytics where WYRPlay provides that setting. If you have an account, you may be able to update account settings or request account deletion through the account interface.",
          "Depending on your state of residence and whether the applicable state privacy law covers WYRPlay, you may have rights to request access to personal information, request deletion, request correction, obtain a portable copy, opt out of certain covered processing, limit certain uses of sensitive personal information, or appeal a privacy-rights decision. We will not discriminate against you for exercising a right protected by applicable law.",
          "To submit a privacy request, email support@wyrplay.com with enough information for us to understand and verify the request. We may request reasonable verification before disclosing or deleting account-linked information.",
        ],
      },
      {
        heading: "California Privacy Disclosures",
        paragraphs: [
          "California's Online Privacy Protection Act requires covered commercial websites that collect personally identifiable information from California consumers to publish privacy disclosures, including the categories of information collected, categories of third parties involved, how users may request review or changes, and the policy's effective date. This notice is structured to provide those disclosures.",
          "WYRPlay does not currently respond to legacy browser Do Not Track signals as a separate technical control. Because WYRPlay does not currently sell personal information or use it for cross-context behavioral advertising, such a signal does not change the service's current data practices. If WYRPlay becomes subject to a law that requires honoring a recognized opt-out preference signal, such as Global Privacy Control for covered processing, WYRPlay will implement the required response before engaging in that covered processing.",
          "The California Consumer Privacy Act applies only when its statutory coverage requirements are met. Nothing in this notice is intended to represent that WYRPlay is currently a covered CCPA business if those thresholds or other requirements are not satisfied.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "We use reasonable administrative, technical, and organizational measures designed to protect information against unauthorized access, loss, misuse, or alteration. No online service can guarantee absolute security, so users should also protect access to their email account and devices.",
        ],
      },
      {
        heading: "International Processing",
        paragraphs: [
          "WYRPlay is intended primarily for users in the United States, but service providers may process information in the United States or other locations where they operate. Privacy protections can differ between jurisdictions.",
        ],
      },
      {
        heading: "Changes to This Notice",
        paragraphs: [
          "We may update this Privacy Notice when our features, providers, or legal obligations change. The effective date shown at the top identifies the version that applies. If a change materially affects how we handle personal information, we will provide additional notice when required by law.",
        ],
      },
      {
        heading: "Contact Us",
        paragraphs: [
          "Questions about this Privacy Notice or privacy requests can be sent to support@wyrplay.com. Before this document is marked reviewed for production release, the operator's final legal identity and any legally required postal contact information must be confirmed.",
        ],
      },
    ],
    terms: [
      {
        heading: "Agreement to These Terms",
        paragraphs: [
          "These Terms of Service govern your access to and use of WYRPlay at www.wyrplay.com. By using the service, you agree to these Terms and the Acceptable Use Policy. If you do not agree, do not use features that require acceptance of these Terms.",
        ],
      },
      {
        heading: "Eligibility and Age",
        paragraphs: [
          "Public question content may be used by families, educators, teens, adults, and children with appropriate adult supervision. Account registration, account-linked content submission, and purchases are intended for users age 13 or older.",
          "Users under 18 should use account or paid features only with permission from a parent or legal guardian. Users under 13 must not independently create an account, submit personal information through account features, or make purchases.",
        ],
      },
      {
        heading: "Accounts and Authentication",
        paragraphs: [
          "If account features are available, you are responsible for maintaining control of the email account or other authentication method used to access WYRPlay and for activity performed through your account.",
          "WYRPlay may require recent re-authentication for sensitive actions such as deleting an account, managing subscriptions, or requesting certain billing operations. We may restrict or suspend account access when reasonably necessary for security, fraud prevention, legal compliance, or enforcement of these Terms.",
        ],
      },
      {
        heading: "The Service",
        paragraphs: [
          "WYRPlay provides Would You Rather questions, voting, browsing, presentation, printing, and related entertainment or educational features. Specific features may change, be added, be removed, or be unavailable in certain environments.",
          "We do not promise that every question will suit every audience or context. Labels such as Kids, Funny, Hard, Friends, Couples, age ranges, or classroom suitability reflect editorial curation and are not a substitute for the judgment of a parent, teacher, organizer, or other responsible adult.",
        ],
      },
      {
        heading: "User-Submitted Content",
        paragraphs: [
          "If WYRPlay enables creation or submission features, you remain responsible for content you submit and must have the rights needed to submit it. You must not submit illegal, infringing, exploitative, harassing, privacy-invasive, or otherwise prohibited material.",
          "You retain ownership of your original content. By submitting content to WYRPlay, you grant WYRPlay a non-exclusive, worldwide, royalty-free license to host, reproduce, display, format, moderate, and distribute that content only as reasonably necessary to operate, secure, improve, and promote the service, subject to applicable law and the feature's published controls.",
          "WYRPlay may reject, hide, remove, or restrict submitted content when reasonably necessary to enforce policies, protect users, comply with law, or maintain the quality and safety of the service.",
        ],
      },
      {
        heading: "Voting, Rankings, and Community Signals",
        paragraphs: [
          "Votes, rankings, and aggregate statistics are provided for entertainment and product functionality. You may not manipulate results through bots, scripts, repeated identities, coordinated abuse, or other deceptive methods.",
          "Aggregate results may change over time and may be adjusted when WYRPlay removes invalid, fraudulent, duplicated, or abusive activity.",
        ],
      },
      {
        heading: "Paid Features, Subscriptions, and Credits",
        paragraphs: [
          "At the effective date of these Terms, WYRPlay's public service does not offer paid purchases or subscriptions. If paid features are introduced, the price, currency, billing cadence, renewal terms, included benefits, credit terms if any, and cancellation method will be disclosed before you authorize the transaction.",
          "Any future recurring subscription will require affirmative consent to the material recurring-charge terms before billing and will provide an online method to stop future recurring charges. Transaction-specific disclosures presented at checkout form part of these Terms for that purchase.",
          "WYRPlay will not treat the mere existence of payment, subscription, refund, or credit infrastructure in the codebase as an offer to consumers. A commercial feature applies only when it is actually enabled and presented to users.",
        ],
      },
      {
        heading: "Refunds and Cancellation",
        paragraphs: [
          "Refund and cancellation rules are described in the Refund and Cancellation Policy. Mandatory consumer rights under applicable law are not waived by these Terms.",
        ],
      },
      {
        heading: "Acceptable Use",
        paragraphs: [
          "You must follow the Acceptable Use Policy. Prohibited conduct includes unlawful activity, harmful or exploitative content, child-safety violations, security attacks, scraping or automation that materially burdens the service, account abuse, payment abuse, and manipulation of votes or rankings.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "WYRPlay's branding, original editorial material, software, graphics, site design, curation, and other protectable content are owned by or licensed to the operator of WYRPlay and are protected by applicable intellectual-property laws.",
          "You may use public questions for ordinary personal, family, classroom, and social play. You may not copy the site's protected presentation, software, question bank, or substantial curated collections for republication, resale, automated extraction, or competing commercial use without permission, except where applicable law permits the use.",
        ],
      },
      {
        heading: "Third-Party Services",
        paragraphs: [
          "WYRPlay may rely on third-party infrastructure or service providers for functions such as hosting, authentication, email delivery, analytics, security, or payments. Those providers may have separate terms or privacy practices that apply to their own services.",
        ],
      },
      {
        heading: "Suspension, Termination, and Account Deletion",
        paragraphs: [
          "You may stop using WYRPlay at any time. If account features are enabled, you may request account deletion through the available account controls or support process.",
          "WYRPlay may suspend or terminate access, remove content, or restrict features when reasonably necessary to address fraud, abuse, security risk, legal obligations, payment disputes, or material violations of these Terms or the Acceptable Use Policy.",
        ],
      },
      {
        heading: "Disclaimers",
        paragraphs: [
          "WYRPlay is provided for entertainment and educational use. To the maximum extent permitted by law, the service is provided on an 'as is' and 'as available' basis without warranties that it will be uninterrupted, error-free, or suitable for every audience, event, classroom, relationship, or purpose.",
          "Nothing in WYRPlay is professional medical, legal, financial, therapeutic, or other regulated professional advice.",
        ],
      },
      {
        heading: "Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by applicable law, WYRPlay and its operator will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from use of the service. Any limitation applies only to the extent the law allows and does not exclude liability that cannot lawfully be limited.",
        ],
      },
      {
        heading: "Indemnity",
        paragraphs: [
          "To the extent permitted by law, if your unlawful conduct, prohibited content, or material breach of these Terms causes a third-party claim against WYRPlay, you agree to be responsible for the resulting losses and reasonable costs to the extent legally attributable to your conduct. This section does not reduce any non-waivable consumer rights.",
        ],
      },
      {
        heading: "Applicable Law and Disputes",
        paragraphs: [
          "These Terms are subject to applicable United States federal and state law. Nothing in these Terms waives mandatory consumer protections or other rights that cannot legally be waived.",
          "WYRPlay does not include a mandatory arbitration or class-action waiver in this draft. Any future dispute-resolution clause must be reviewed with the operator's final legal identity and state of organization before it is added.",
        ],
      },
      {
        heading: "Changes to These Terms",
        paragraphs: [
          "We may update these Terms when the service or legal requirements change. The effective date shown at the top identifies the current version. Material changes will receive additional notice when required by law.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions about these Terms can be sent to support@wyrplay.com.",
        ],
      },
    ],
    acceptable_use: [
      {
        heading: "Purpose",
        paragraphs: [
          "This Acceptable Use Policy protects WYRPlay users, children and families who may use public content, the integrity of voting and community features, and the security of the service. It applies whenever you access WYRPlay or use an account, submission, voting, printing, presentation, or paid feature.",
        ],
      },
      {
        heading: "Illegal or Harmful Conduct",
        paragraphs: [
          "Do not use WYRPlay to violate law, facilitate crime, defraud another person, threaten or harass others, encourage violence, or distribute material that is unlawful in the jurisdiction that applies to you or to WYRPlay.",
        ],
      },
      {
        heading: "Child Safety",
        paragraphs: [
          "Do not submit, request, upload, link to, or distribute sexual, exploitative, grooming, abusive, or otherwise harmful content involving minors. Do not use WYRPlay to contact, profile, solicit personal information from, or manipulate a child in a manner that is unsafe, deceptive, or unlawful.",
          "Content submitted for Kids, classroom, or family-facing areas must be appropriate for the labeled audience and must not contain adult sexual content, graphic violence, dangerous challenges, targeted harassment, or other material that defeats the safety purpose of those collections.",
        ],
      },
      {
        heading: "Harassment, Hate, and Personal Harm",
        paragraphs: [
          "Do not use the service to bully, stalk, threaten, dox, shame, or target a person or protected group. Do not publish another person's private or sensitive information without a lawful basis and appropriate permission.",
        ],
      },
      {
        heading: "Impersonation and Deception",
        paragraphs: [
          "Do not impersonate another person or organization, misrepresent your affiliation, create deceptive accounts, submit fraudulent support or refund requests, or mislead users about the source or purpose of content.",
        ],
      },
      {
        heading: "Platform Integrity",
        paragraphs: [
          "Do not manipulate votes, rankings, popularity signals, contests, or usage statistics through bots, scripts, coordinated fake activity, repeated identities, cookie resets, automation, or other deceptive means.",
          "Do not scrape, crawl, copy, or extract the service at a rate or scale that materially burdens WYRPlay, bypasses access controls, ignores technical restrictions, or is used to republish or commercially exploit protected content. Ordinary search-engine indexing authorized by WYRPlay's robots directives is not prohibited by this section.",
        ],
      },
      {
        heading: "Security and Access Controls",
        paragraphs: [
          "Do not probe, scan, exploit, bypass, reverse engineer for a prohibited purpose, or attempt unauthorized access to accounts, databases, APIs, administrative functions, payment systems, rate limits, security controls, or infrastructure.",
          "Do not introduce malware, destructive code, denial-of-service traffic, credential attacks, automated abuse, or any mechanism intended to interfere with the availability or integrity of the service.",
        ],
      },
      {
        heading: "Accounts, Payments, Refunds, and Credits",
        paragraphs: [
          "If account or commerce features are enabled, do not abuse account creation, authentication, discounts, trials, refunds, chargebacks, subscriptions, credits, entitlements, or other commercial mechanisms. Do not attempt to obtain benefits you did not purchase or earn, or to spend, transfer, duplicate, or reverse entitlements through technical manipulation.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "Do not upload or distribute content that you do not have the right to use. Do not reproduce WYRPlay's protected branding, software, design, or substantial curated content in a way that infringes intellectual-property rights or falsely suggests endorsement or affiliation.",
        ],
      },
      {
        heading: "Enforcement",
        paragraphs: [
          "WYRPlay may remove content, invalidate activity, limit features, suspend or terminate accounts, block abusive traffic, or take other reasonable steps to enforce this policy, protect users, preserve service integrity, or comply with law.",
          "Enforcement decisions may consider context, severity, repetition, harm, intent, and risk. Serious child-safety, fraud, or security issues may result in immediate restriction without prior notice where permitted by law.",
        ],
      },
      {
        heading: "Reporting Problems",
        paragraphs: [
          "Report abuse, child-safety concerns, security issues, copyright concerns, or other policy violations to support@wyrplay.com with enough detail for us to investigate.",
        ],
      },
    ],
    refund_policy: [
      {
        heading: "Current Service Status",
        paragraphs: [
          "At the effective date of this policy, WYRPlay's public service does not offer consumer purchases, subscriptions, recurring charges, or paid credits. There is therefore no current consumer charge to refund or cancel.",
          "If WYRPlay introduces paid features, this policy will apply together with the transaction-specific terms shown before purchase. Material price, renewal, billing, and cancellation terms will be presented clearly before billing information is used to complete a transaction.",
        ],
      },
      {
        heading: "One-Time Digital Purchases",
        paragraphs: [
          "If one-time digital purchases are introduced, the checkout page will identify the product, price, currency, and material delivery terms before purchase. Unless the checkout terms or applicable law provide otherwise, a completed digital purchase will not be automatically refundable solely because a user changes their mind after the digital benefit has been delivered.",
          "We will review requests involving duplicate charges, a failed or materially defective delivery, unauthorized charges, incorrect billing, or other circumstances where a refund is required by law or reasonably appropriate.",
        ],
      },
      {
        heading: "Subscriptions and Automatic Renewal",
        paragraphs: [
          "If subscriptions are introduced, WYRPlay will clearly disclose the recurring price, billing interval, automatic-renewal nature, any trial or promotional period, material cancellation terms, and how to cancel before the user affirmatively consents to recurring charges.",
          "An online subscription will provide an online cancellation method designed to stop future recurring charges without unnecessary barriers. Cancellation ordinarily affects future renewal; access for an already-paid period may continue until the end of that period unless the checkout terms or law provide otherwise.",
        ],
      },
      {
        heading: "Refunds for Subscription Charges",
        paragraphs: [
          "Unless the checkout terms or applicable law provide otherwise, subscription charges for a billing period that has already begun are not automatically prorated merely because the user cancels during that period. We may provide a full or partial refund where required by law, where a duplicate or unauthorized charge occurred, where access materially failed, or where we otherwise determine a refund is appropriate.",
        ],
      },
      {
        heading: "Credits and Entitlements",
        paragraphs: [
          "If WYRPlay later sells or grants credits, the product page or checkout flow will disclose the credit type, quantity, expiration rule if any, and material restrictions. Consumed or expired credits may be non-refundable except where required by law or where the underlying transaction qualifies for a refund.",
          "If a refund would require reversing a digital entitlement that has already been consumed or cannot safely be reversed automatically, WYRPlay may place the request into manual review rather than creating an inconsistent payment or entitlement state.",
        ],
      },
      {
        heading: "How to Cancel",
        paragraphs: [
          "If subscriptions are enabled, users will be able to manage or cancel an active subscription through the Billing area of the authenticated account or another clearly disclosed online cancellation path. Deleting an account is not intended to be the only method of cancelling a recurring charge.",
        ],
      },
      {
        heading: "How to Request a Refund or Report a Billing Problem",
        paragraphs: [
          "If paid features are enabled, use the Billing area when an in-product refund option is available or contact support@wyrplay.com. Include the account email, approximate transaction date, amount, and a description of the issue. Do not send full payment-card numbers or security codes by email.",
        ],
      },
      {
        heading: "Chargebacks and Unauthorized Transactions",
        paragraphs: [
          "If you believe a charge was unauthorized, contact us promptly so we can investigate. You may also have rights through your card issuer or payment provider. Nothing in this policy limits rights that cannot be waived under applicable law.",
        ],
      },
      {
        heading: "California and Other State Requirements",
        paragraphs: [
          "If WYRPlay offers automatically renewing subscriptions to California consumers, the subscription flow must satisfy California's Automatic Renewal Law, including required disclosures, affirmative consent, reminders when applicable, and a clear online cancellation method. Other states may impose additional automatic-renewal, cancellation, or refund requirements.",
        ],
      },
      {
        heading: "Changes to This Policy",
        paragraphs: [
          "WYRPlay will update this policy before enabling a materially different paid model. The effective date shown at the top identifies the current version.",
        ],
      },
    ],
    account_deletion: [
      {
        heading: "When This Page Applies",
        paragraphs: [
          "This page applies if WYRPlay account features are enabled and you have an authenticated WYRPlay account. If you only use public, no-account features, there may be no account profile to delete.",
        ],
      },
      {
        heading: "How to Request Account Deletion",
        paragraphs: [
          "When account deletion is enabled, sign in, open Account Settings, and use the Delete Account control. Sensitive deletion actions may require a recent authenticated session and an explicit confirmation.",
          "If you cannot access your account but believe WYRPlay still holds account-linked personal information about you, contact support@wyrplay.com from the account email address when possible. We may need to verify your identity before acting on the request.",
        ],
      },
      {
        heading: "What Happens After You Request Deletion",
        paragraphs: [
          "Once a valid deletion request is accepted, WYRPlay's deletion workflow is designed to block access to account-scoped product data and then complete downstream cleanup. If a dependency is temporarily unavailable, the deletion request remains durable and the system may retry cleanup automatically.",
          "The workflow removes the authentication identity and detaches or deletes account-scoped product data where deletion is appropriate. The process is designed so a failed downstream step does not silently restore access to an account that is already pending deletion.",
        ],
      },
      {
        heading: "Subscriptions and Billing",
        paragraphs: [
          "If an account has an active or pending subscription, the deletion workflow is designed to prepare cancellation before completing identity deletion. If your goal is only to stop future recurring charges, use the subscription cancellation control in Billing rather than deleting the entire account.",
          "Deleting an account does not erase obligations, refunds, disputes, chargebacks, or transaction records that must be completed or retained for accounting, fraud prevention, security, or legal compliance.",
        ],
      },
      {
        heading: "Information We May Retain",
        paragraphs: [
          "We may retain limited transaction, refund, tax, accounting, fraud-prevention, security, legal-hold, or dispute records when retention is reasonably necessary or required by law. Retained records are limited to the purpose that justifies keeping them and are not treated as an active consumer account.",
          "Anonymous or irreversibly de-identified information, including aggregate gameplay statistics that can no longer reasonably be linked to you, may remain after account deletion.",
        ],
      },
      {
        heading: "Email and Authentication Records",
        paragraphs: [
          "The deletion workflow is designed to delete the active authentication identity. Some short-lived security, audit, abuse-prevention, or delivery records may remain for their applicable retention period where necessary to protect the service or comply with law.",
        ],
      },
      {
        heading: "Children and Parent Requests",
        paragraphs: [
          "WYRPlay does not knowingly permit children under 13 to create accounts without a legally sufficient parental process. A parent or legal guardian who believes a child under 13 provided personal information to WYRPlay should contact support@wyrplay.com so we can review and, when appropriate, delete the information.",
        ],
      },
      {
        heading: "Questions About Deletion",
        paragraphs: [
          "For questions about account deletion or a privacy-rights request, contact support@wyrplay.com.",
        ],
      },
    ],
  },
} as const satisfies LegalConfig;
