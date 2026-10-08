import type { LegalConfig } from "@/platform/legal/types";

export const legalConfig = {
  releaseStatus: "reviewed",
  operator: {
    legalName: "Wang Yufei",
    jurisdiction: "China",
    supportEmail: "support@wyrplay.com",
  },
  minimumAge: 13,
  dataCategories: [
    "anonymous voting and gameplay interaction data",
    "account and authentication information for registered accounts",
    "technical, security, fraud-prevention, and diagnostic information",
    "support communications and inquiries",
    "transaction, subscription, refund, and entitlement records for subscription purchases",
    "site analytics information if analytics is enabled and permitted",
    "advertising delivery, interaction, and measurement data when advertising is enabled on eligible pages",
  ],
  authMethods: [],
  processors: [
    {
      name: "Resend",
      purpose: "Transactional email delivery for account or support communications",
      privacyUrl: "https://resend.com/legal/privacy-policy",
    },
    {
      name: "Google Analytics",
      purpose:
        "Site measurement and product analytics (designated provider; not enabled in the current production deployment)",
      privacyUrl: "https://policies.google.com/privacy",
    },
    {
      name: "Google AdSense",
      purpose:
        "Advertising delivery and measurement when advertising is enabled on eligible WYRPlay pages",
      privacyUrl: "https://policies.google.com/privacy",
    },
    {
      name: "Cloudflare Turnstile",
      purpose: "Abuse and automated-traffic prevention when a Turnstile challenge is presented",
      privacyUrl: "https://www.cloudflare.com/privacypolicy/",
    },
    {
      name: "Waffo",
      purpose: "Payment, subscription, and refund processing for WYRPlay subscriptions",
    },
  ],
  paymentModel: "none",
  oneTimePurchases: false,
  subscriptions: false,
  credits: false,
  refundPolicy: {
    summary:
      "WYRPlay operates on an automatic-renewal subscription model without a free trial. Public subscription checkout is not yet open on the production service, so no recurring consumer charges are currently incurred. Once subscription checkout is opened, users can cancel online at any time to stop future renewals while retaining access through the end of the currently paid billing period. Subscription fees are non-refundable on a prorated basis solely due to cancellation during a billing period, subject to refunds for duplicate charges, unauthorized transactions, material service failure, billing errors, or where required by applicable law.",
    cancellationSummary:
      "Public subscription checkout is not currently open in production. When subscription functionality is opened, subscribers can cancel online through Account Settings or Billing to stop future renewals. Access remains active through the end of the current already-paid billing period.",
  },
  subscriptionTerms:
    "WYRPlay subscriptions renew automatically at the end of each billing cycle unless cancelled online prior to renewal. There is no free trial. Public subscription checkout is not yet open in production, so no subscription charges are currently incurred. When subscription functionality is opened, online cancellation stops future renewal charges while access remains available through the end of the current already-paid period. Subscription charges are not automatically prorated upon cancellation. Refunds are provided for duplicate charges, unauthorized transactions, material service failures, billing errors, or as required by applicable law.",
  retentionRules: [
    {
      category: "Kids aggregate-only voting records",
      period:
        "database vote contributions may be retained indefinitely for aggregate results after request-level metadata is no longer retained; each row uses a one-time record token that is not reused to recognize a child or browser over time",
      basis: "aggregate product results and service integrity",
    },
    {
      category: "Kids request and runtime log metadata",
      period:
        "under the current Vercel Hobby plan, Vercel Runtime Logs are retained for no more than one hour; the Kids voting route does not write separate application logs containing the vote request",
      basis: "temporary service operation, security, reliability, and abuse investigation",
    },
    {
      category: "general-audience anonymous voting and gameplay records",
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
      "Public account registration is not currently open in the production service. When account functionality is opened, users can request account deletion from Account Settings or by contacting support. The deletion workflow revokes account access, coordinates any active subscription cancellation, and deletes account-scoped personal data, retaining only limited transaction, fraud-prevention, security, or legal compliance records where required by applicable law.",
  },
  internationalTransfers:
    "WYRPlay is operated by Wang Yufei, an individual operator in China, and is available globally. Service providers such as hosting, database, and infrastructure vendors may process data in the United States or other locations where they operate. When applicable law requires safeguards for international data transfers, WYRPlay implements appropriate legal mechanisms.",
  documents: {
    privacy: { version: "1.1", effectiveDate: "2026-10-07", reviewStatus: "reviewed" },
    terms: { version: "1.0", effectiveDate: "2026-10-04", reviewStatus: "reviewed" },
    acceptable_use: { version: "1.0", effectiveDate: "2026-10-04", reviewStatus: "reviewed" },
    refund_policy: { version: "1.0", effectiveDate: "2026-10-04", reviewStatus: "reviewed" },
    account_deletion: { version: "1.0", effectiveDate: "2026-10-04", reviewStatus: "reviewed" },
  },
  content: {
    privacy: [
      {
        heading: "Who We Are and Scope",
        paragraphs: [
          "WYRPlay is the Would You Rather service available at https://www.wyrplay.com. WYRPlay is operated by Wang Yufei, a sole individual operator based in China. This Privacy Notice explains how we handle information when you browse questions, vote, use interactive features, contact support, or use account and subscription features.",
          "This notice applies globally, with specific disclosures provided for jurisdictions where our users reside, including applicable United States privacy requirements.",
        ],
      },
      {
        heading: "Audience and Age Rules",
        paragraphs: [
          "Public WYRPlay content may be used by families, educators, teens, adults, and children with appropriate adult supervision. Account registration, paid subscription features, and any submission of personal information are strictly intended for users age 13 or older.",
          "If you are under 13, you must not independently create an account, submit personal information through account features, or make subscription purchases. A parent, teacher, or other responsible adult may use WYRPlay together with a child and may contact us about privacy questions at support@wyrplay.com.",
          "Users ages 13 through 17 should use account or subscription features only with permission from a parent or legal guardian.",
          "If we learn that personal information was collected from a child under 13 in a manner requiring parental notice or consent under the Children's Online Privacy Protection Act (COPPA), we will take prompt steps to delete the information or otherwise comply with applicable law.",
        ],
      },
      {
        heading: "Information You Provide",
        paragraphs: [
          "You may provide information directly when you contact support@wyrplay.com. Public account registration is not currently open in the production service. When account functionality is opened, account features may process an email address and account preferences as described in this notice.",
          "WYRPlay operates on a subscription commerce model. Subscription transactions, payments, and refunds are processed by our payment provider, Waffo. When subscription checkout is opened, WYRPlay receives transaction metadata such as subscription status, payment reference, currency, and amount. WYRPlay is not designed to and does not store complete payment-card numbers.",
          "At the effective date of this notice, public subscription checkout is not yet open on the production service, and no recurring consumer charges are currently processed.",
        ],
      },
      {
        heading: "Gameplay, Voting, and Anonymous Identifiers",
        paragraphs: [
          "WYRPlay records question interactions, A-or-B votes, timestamps, aggregate vote counts, and similar gameplay data necessary to deliver the service.",
          "On general-audience portions of WYRPlay, anonymous voting may use a first-party HttpOnly cookie to associate a browser with a vote, preserve vote integrity, and reduce duplicate or abusive submissions. Questions that can appear in the Kids collection use a separate privacy mode: WYRPlay does not create or read the persistent voter cookie for those votes, and the server stores each vote with a one-time record token that is not reused to recognize a person or browser over time.",
        ],
      },
      {
        heading: "Technical and Security Information",
        paragraphs: [
          "Our systems and infrastructure providers process technical information such as IP addresses, device and browser metadata, request timestamps, error records, and security signals to keep the site operational, enforce rate limits, and investigate abuse.",
          "When an anti-abuse challenge such as Cloudflare Turnstile is presented, the provider may process technical information necessary to distinguish genuine users from automated or malicious traffic.",
        ],
      },
      {
        heading: "Cookies, Local Storage, and Similar Technologies",
        paragraphs: [
          "WYRPlay uses first-party storage when reasonably necessary to deliver requested functionality, remember preferences, support authentication, maintain vote integrity, or record privacy choices.",
          "Analytics technologies are not required for core gameplay. Where an analytics consent choice is presented, analytics scripts are loaded only after affirmative consent is granted, and users can withdraw consent at any time through available privacy settings.",
        ],
      },
      {
        heading: "Site Measurement and Analytics",
        paragraphs: [
          "Google Analytics 4 is WYRPlay's designated analytics provider. Microsoft Clarity is not used.",
          "In the current production deployment, Google Analytics 4 is not enabled, and no analytics data is collected from production visitors. When analytics is enabled in a deployment, it is loaded only after any required consent is granted, and it is configured to avoid collecting email addresses or unnecessary user-entered content as event properties.",
        ],
      },
      {
        heading: "Advertising and Google AdSense",
        paragraphs: [
          "WYRPlay is preparing to use Google AdSense to serve advertising on eligible pages of the service. Google AdSense ad serving is not currently enabled in production, and no advertisements are currently served or displayed.",
          "When advertising is enabled in the future, third-party vendors, including Google, may use cookies to serve ads based on prior visits to WYRPlay or other websites. Third parties (including Google and its advertising partners) may place and read cookies in users' browsers, or use web beacons and similar technologies to collect information in connection with ad serving.",
          "Processed information may include IP addresses, browser and device identifiers, request timestamps, and ad interaction information where applicable. This information may be used for ad serving, fraud prevention, measurement, and, where legally permitted and appropriately consented, personalized advertising.",
          "Users may manage or opt out of personalized advertising by visiting Google Ads Settings at https://adssettings.google.com. You can also review how Google uses information from sites that use its services at https://policies.google.com/technologies/partner-sites.",
        ],
      },
      {
        heading: "How We Use Information",
        paragraphs: [
          "We use information to provide and secure WYRPlay, authenticate users, aggregate gameplay and voting statistics, respond to support inquiries, process subscriptions and refunds through Waffo once checkout is open, prevent fraud and automated abuse, diagnose technical issues, and comply with legal obligations.",
          "We collect and use information only for purposes that are reasonably necessary, proportionate, and directly related to operating the service.",
        ],
      },
      {
        heading: "How We Disclose Information",
        paragraphs: [
          "We disclose information to third-party service providers performing essential functions on our behalf, including hosting, transactional email delivery (Resend), security and anti-abuse verification (Cloudflare Turnstile), payment and subscription processing (Waffo), site measurement (Google Analytics 4), and advertising delivery and measurement (Google AdSense, when advertising is enabled on eligible pages). Service providers receive only the data reasonably needed to perform their services.",
          "We may disclose information where required by law, to respond to valid legal process, or when reasonably necessary to protect the safety, security, and integrity of WYRPlay, its users, or the public.",
          "WYRPlay does not sell personal information for money. WYRPlay is preparing to use Google AdSense to serve advertising on eligible pages. Google AdSense ad serving is not currently enabled in production, and no advertisements are currently displayed. When advertising is enabled, Google and its advertising partners may process information required for ad serving and measurement. WYRPlay will configure advertising in accordance with applicable privacy and child-directed requirements before actual ad serving.",
        ],
      },
      {
        heading: "Children's Privacy",
        paragraphs: [
          "The WYRPlay Kids collection is specifically designed for children, families, and educators. WYRPlay treats that area as a child-directed portion of the service for privacy-design purposes.",
          "WYRPlay strictly prohibits children under 13 from creating accounts, submitting personal information, or purchasing subscriptions. We do not use personal information from children under 13 for behavioral advertising or profiling. Google AdSense ad serving is not currently enabled in production. Before any Google advertising is enabled in any child-directed area, WYRPlay will apply the required child-directed treatment and advertising restrictions.",
          "For voting on questions in the Kids collection, WYRPlay does not create or read the persistent voter cookie. Each stored Kids vote receives a server-generated one-time record token that is not returned to the browser and is not reused to recognize the same child or browser over time. Legacy Kids vote records were sanitized by replacing former reusable voter identifiers with one-time record tokens while preserving aggregate A/B counts.",
          "WYRPlay does not use Kids voting data for behavioral advertising or profiling. Kids voting data is used only for aggregate results, service operation, security, and abuse prevention.",
        ],
      },
      {
        heading: "Data Retention",
        paragraphs: [
          "For Kids voting, the application database stores the question identifier, A/B choice, timestamps, and a server-generated one-time record token. The token is not returned to the browser, is not reused to recognize a child or browser, and is not stored with a persistent Kids voter identifier. These vote contributions may be retained indefinitely for aggregate results after request-level metadata is no longer retained.",
          "The Kids voting route does not write separate application logs containing the vote request. Vercel may temporarily process request and runtime metadata needed to deliver and secure the request; under WYRPlay's current Vercel Hobby plan, Vercel Runtime Logs are retained for no more than one hour. After that provider log window, WYRPlay does not retain a reusable child/browser identifier with the Kids A/B choice. Aggregate or de-identified statistics that cannot reasonably identify an individual may be retained indefinitely.",
          "Account data is maintained while an account is active and during the account-deletion workflow once account functionality is opened. Other operational, security, commerce, support, and diagnostic records are retained only as described by the applicable operational or legal purpose.",
        ],
      },
      {
        heading: "Your Choices and Privacy Rights",
        paragraphs: [
          "You can decline or withdraw analytics consent where analytics is configured. Public account registration is not currently open in the production service. When account functionality is opened, registered users can manage preferences or request account deletion through Account Settings.",
          "Depending on your location and applicable privacy laws, you may have statutory rights to request access to personal information, request deletion, request correction, obtain a portable copy, or opt out of covered processing. We will not discriminate against you for exercising rights granted by law.",
          "To submit a privacy inquiry or rights request, email support@wyrplay.com with sufficient detail for us to verify and respond to your request.",
        ],
      },
      {
        heading: "California and State Privacy Disclosures",
        paragraphs: [
          "Under the California Online Privacy Protection Act (CalOPPA) and related laws, commercial websites collecting personally identifiable information from California consumers must disclose information practices. This notice provides those required disclosures.",
          "WYRPlay does not currently respond to browser Do Not Track signals as a separate technical toggle. In the current production deployment, Google Analytics 4 is disabled, and Microsoft Clarity is not used. Google AdSense ad serving is not currently active in production; when advertising is enabled on eligible pages, advertising and personalization choices can be managed through Google Ads Settings as described in this notice.",
          "The California Consumer Privacy Act (CCPA) applies where statutory coverage criteria are met; nothing in this notice represents that WYRPlay is a covered CCPA business if statutory thresholds are not satisfied.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "We implement reasonable administrative, technical, and physical measures designed to protect information from unauthorized access, loss, misuse, or alteration. Because no internet transmission is completely secure, users should also take care to safeguard their devices and email accounts.",
        ],
      },
      {
        heading: "International Processing",
        paragraphs: [
          "WYRPlay is operated by Wang Yufei, an individual operator in China. Our hosting, database, and infrastructure providers may store and process data in the United States and other global locations. Where required by applicable law, appropriate safeguards are utilized for cross-border data transfers.",
        ],
      },
      {
        heading: "Changes to This Notice",
        paragraphs: [
          "We may update this Privacy Notice from time to time. The effective date at the top indicates the current version. Material changes will be accompanied by prominent notice where required by law.",
        ],
      },
      {
        heading: "Contact Us",
        paragraphs: [
          "For questions regarding this Privacy Notice or your personal information, contact Wang Yufei at support@wyrplay.com.",
        ],
      },
    ],
    terms: [
      {
        heading: "Agreement to These Terms",
        paragraphs: [
          "These Terms of Service govern your access to and use of WYRPlay at https://www.wyrplay.com. WYRPlay is operated by Wang Yufei, a sole individual operator in China. By accessing or using the service, you agree to be bound by these Terms and the Acceptable Use Policy. If you do not agree, do not use the service.",
        ],
      },
      {
        heading: "Eligibility and Age",
        paragraphs: [
          "Public question browsing and gameplay may be enjoyed by families, educators, teens, adults, and children under appropriate adult supervision.",
          "Account registration and paid subscription features are strictly intended for individuals age 13 or older. Individuals under 13 must not independently create an account or make subscription purchases.",
          "Users ages 13 through 17 may use account or subscription features only with permission from a parent or legal guardian.",
        ],
      },
      {
        heading: "Accounts and Authentication",
        paragraphs: [
          "Public account registration is not currently open in the production service. When account functionality is opened, the account and authentication rules described below apply.",
          "When you create an account, you are responsible for maintaining the security of your authentication credentials and for all activities that occur under your account.",
          "WYRPlay may require re-authentication for sensitive account actions such as deleting an account or managing subscriptions. We may suspend or restrict account access when reasonably necessary for security, fraud prevention, legal compliance, or enforcement of these Terms.",
        ],
      },
      {
        heading: "The Service",
        paragraphs: [
          "WYRPlay provides Would You Rather questions, voting, browsing, presentation, printing, and related educational and entertainment features. Specific features may change, be enhanced, or be modified over time.",
          "Audience labels such as Kids, Funny, Hard, Friends, and Couples represent editorial categorization and do not replace the judgment of a parent, teacher, or responsible adult.",
        ],
      },
      {
        heading: "User Feedback and Communications",
        paragraphs: [
          "WYRPlay does not currently operate a public user-generated content submission or community publishing repository. You may submit product feedback, questions, or support requests to us.",
          "By submitting feedback or communications, you grant WYRPlay a non-exclusive, worldwide, royalty-free license to use, adapt, and implement such suggestions to operate, improve, and secure the service without compensation or obligation to you.",
        ],
      },
      {
        heading: "Voting and Platform Integrity",
        paragraphs: [
          "Voting statistics, rankings, and aggregate percentages are provided for entertainment and product utility. You may not manipulate results through bots, automated scripts, repeated false identities, coordinated attacks, or deceptive methods.",
          "WYRPlay reserves the right to adjust, filter, or remove votes or activity resulting from automated, abusive, or fraudulent behavior.",
        ],
      },
      {
        heading: "Subscriptions and Billing",
        paragraphs: [
          "WYRPlay's commercial offering is based on recurring paid subscriptions with automatic renewal. There is no free trial.",
          "The billing interval and price shown at checkout, together with the included benefits, are presented clearly before purchase authorization.",
          "Subscriptions renew automatically at the end of each billing period unless cancelled by the user prior to renewal. When subscription checkout is opened, you may cancel your subscription online at any time through Account Settings or Billing. Online cancellation stops future renewal charges; your subscription benefits remain active through the end of the current already-paid billing period.",
          "Payment processing, subscription management, and refund disbursements are handled securely by our payment provider, Waffo. WYRPlay does not store complete payment-card numbers.",
          "At the effective date of these Terms, subscription checkout is not yet open on the public production service, and no recurring consumer charges are currently incurred. Once subscription checkout is opened, these subscription terms govern all purchase transactions.",
        ],
      },
      {
        heading: "Refunds and Cancellation",
        paragraphs: [
          "Subscription charges for an already-started billing period are not automatically refunded on a prorated basis merely because you cancel during that period. Cancellation stops future renewal charges at the end of the paid term.",
          "Refund exceptions are provided in accordance with our Refund and Cancellation Policy in cases of duplicate charges, unauthorized charges, material service failures, billing errors, or where a refund is mandated by applicable law.",
        ],
      },
      {
        heading: "Acceptable Use",
        paragraphs: [
          "You must comply with our Acceptable Use Policy at all times. Prohibited behavior includes unlawful conduct, child safety violations, harassment, platform manipulation, security attacks, unauthorized scraping, and payment or billing abuse.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "WYRPlay's branding, software, design, question curation, graphics, and compilation are owned by or licensed to Wang Yufei and are protected by applicable intellectual property laws.",
          "You may use public questions for personal, family, classroom, and social gameplay. You may not systematically scrape, reproduce, redistribute, or commercially exploit WYRPlay content without prior written permission.",
        ],
      },
      {
        heading: "Third-Party Services",
        paragraphs: [
          "WYRPlay utilizes third-party infrastructure and service providers for hosting, transactional email delivery (Resend), security challenges (Cloudflare Turnstile), payments (Waffo), and measurement (Google Analytics 4). Such providers operate under their own applicable terms and policies.",
        ],
      },
      {
        heading: "Suspension, Termination, and Deletion",
        paragraphs: [
          "You may discontinue using WYRPlay at any time. Public account registration is not currently open in the production service; when account functionality is opened, you may request account deletion through Account Settings or by emailing support@wyrplay.com.",
          "We may suspend or terminate your access to the service or your account if you materially violate these Terms or the Acceptable Use Policy, engage in fraud or abuse, or where necessary to comply with legal obligations.",
        ],
      },
      {
        heading: "Disclaimers",
        paragraphs: [
          "WYRPlay is provided for entertainment and educational purposes on an 'as is' and 'as available' basis, without warranties of any kind, whether express or implied.",
          "Nothing on WYRPlay constitutes professional medical, legal, financial, or psychological advice.",
        ],
      },
      {
        heading: "Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by applicable law, Wang Yufei and WYRPlay will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Liability that cannot lawfully be limited under applicable mandatory consumer law is not excluded.",
        ],
      },
      {
        heading: "Indemnity",
        paragraphs: [
          "To the extent permitted by law, you agree to indemnify and hold harmless Wang Yufei and WYRPlay from claims, damages, and expenses arising from your unlawful conduct, material violation of these Terms, or infringement of third-party rights. This provision does not restrict non-waivable statutory consumer protections.",
        ],
      },
      {
        heading: "Governing Law and Dispute Resolution",
        paragraphs: [
          "These Terms are governed by and construed in accordance with the laws of the People’s Republic of China, without regard to conflict of law principles.",
          "Nothing in these Terms excludes, limits, or overrides mandatory consumer rights that you are entitled to under the laws of your habitual residence and that cannot be waived by agreement.",
          "These Terms do not impose mandatory arbitration, do not include a class-action waiver, and do not establish a China-only exclusive forum. Disputes may be submitted to courts having jurisdiction under applicable law.",
        ],
      },
      {
        heading: "Changes to These Terms",
        paragraphs: [
          "We may update these Terms as the service and legal requirements evolve. The effective date at the top indicates the current version. Material modifications will be notified as required by applicable law.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Inquiries regarding these Terms should be directed to Wang Yufei at support@wyrplay.com.",
        ],
      },
    ],
    acceptable_use: [
      {
        heading: "Purpose",
        paragraphs: [
          "This Acceptable Use Policy protects WYRPlay users, children and families who enjoy our questions, the integrity of voting features, and the reliability of our service. It applies to all users accessing WYRPlay.",
        ],
      },
      {
        heading: "Illegal or Harmful Conduct",
        paragraphs: [
          "Do not use WYRPlay to violate applicable laws, facilitate criminal activity, threaten or harass others, encourage violence, or distribute unlawful material.",
        ],
      },
      {
        heading: "Child Safety",
        paragraphs: [
          "Do not submit, request, link to, or transmit sexual, exploitative, abusive, or harmful material involving minors. Do not use the service to contact, profile, or solicit personal information from children.",
          "Interactions in the Kids and family collections must remain safe and suitable for all audiences, free from graphic violence, vulgarity, dangerous stunts, or targeted harassment.",
        ],
      },
      {
        heading: "Harassment, Hate, and Personal Harm",
        paragraphs: [
          "Do not use the service to bully, stalk, dox, intimidate, or demean individuals or protected groups. Do not post or transmit private personal information without legal authorization.",
        ],
      },
      {
        heading: "Impersonation and Deception",
        paragraphs: [
          "Do not impersonate any person or entity, misrepresent affiliations, operate fraudulent accounts, or submit deceptive support or refund claims.",
        ],
      },
      {
        heading: "Platform and Voting Integrity",
        paragraphs: [
          "Do not manipulate votes, rankings, or gameplay statistics using automated scripts, bots, coordinated networks, repeated browser emulation, or proxy abuse.",
          "Do not crawl, scrape, or extract content at rates that degrade system performance or circumvent technical access restrictions. Standard search engine indexing conforming to robots.txt is permitted.",
        ],
      },
      {
        heading: "Security and Technical Restrictions",
        paragraphs: [
          "Do not probe, scan, or attempt unauthorized access to accounts, APIs, databases, payment workflows, security controls, or infrastructure.",
          "Do not introduce viruses, malware, denial-of-service traffic, or automated attacks intended to disrupt the availability or integrity of the service.",
        ],
      },
      {
        heading: "Accounts, Subscriptions, and Billing",
        paragraphs: [
          "Do not abuse account registration, authentication, subscriptions, payment channels, refunds, or chargeback mechanisms.",
          "Do not attempt to obtain subscription access through fraudulent payment methods, technical manipulation, or unauthorized account access.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "Do not copy, reproduce, or republish WYRPlay's proprietary code, visual designs, branding, or substantial curated question banks in violation of copyright and intellectual property laws.",
        ],
      },
      {
        heading: "Enforcement",
        paragraphs: [
          "We reserve the right to investigate violations, invalidate fraudulent votes, restrict features, or suspend accounts when necessary to enforce this policy, protect users, or comply with law.",
          "Severe safety, fraud, or security violations may result in immediate access termination without prior notice where permitted by law.",
        ],
      },
      {
        heading: "Reporting Violations",
        paragraphs: [
          "Report safety concerns, policy violations, or abusive behavior to support@wyrplay.com with relevant details for investigation.",
        ],
      },
    ],
    refund_policy: [
      {
        heading: "Subscription Model and Production Status",
        paragraphs: [
          "WYRPlay operates on a recurring paid subscription model with automatic renewal and no free trial. Payments and subscription billing are processed by our payment provider, Waffo.",
          "At the effective date of this policy, subscription checkout is not yet open on the public production service, and no recurring consumer charges are currently incurred. Once subscription checkout is opened, the terms of this policy apply to all WYRPlay subscriptions.",
        ],
      },
      {
        heading: "Automatic Renewal and Online Cancellation",
        paragraphs: [
          "Subscriptions automatically renew at the end of the billing interval shown at checkout unless cancelled prior to renewal.",
          "When subscription checkout is opened, subscribers can cancel online at any time through Account Settings or the Billing section. Online cancellation stops future renewal charges. Cancelling does not immediately terminate access; your paid subscription benefits remain available through the end of the current already-paid billing period.",
        ],
      },
      {
        heading: "Refund Rules and Exceptions",
        paragraphs: [
          "Subscription charges for an already-started billing period are not automatically refunded on a prorated basis solely because a user decides to cancel during that period.",
          "Refunds are provided under the following recognized exception circumstances:",
          "1. Duplicate charge: An accidental double charge caused by technical or processing error;",
          "2. Unauthorized transaction: A verified unauthorized charge not made by the account holder;",
          "3. Material service failure: A persistent service outage or substantial failure to deliver promised features during the paid period;",
          "4. Billing error: An incorrect amount or erroneous transaction attributable to the service or payment processor;",
          "5. Statutory requirement: Any refund mandated by applicable consumer protection laws that cannot be excluded by agreement.",
        ],
      },
      {
        heading: "How to Cancel a Subscription",
        paragraphs: [
          "Public subscription checkout is not currently open in production. When subscription functionality is opened, sign in to your WYRPlay account, open Account Settings or Billing, and select Cancel Subscription. Confirmation of cancellation will be displayed, and no further renewal charges will occur. Deleting your entire account is not necessary to cancel recurring billing.",
        ],
      },
      {
        heading: "How to Request a Refund",
        paragraphs: [
          "To request a refund under one of the recognized exceptions, email support@wyrplay.com from your registered account email address. Include the approximate transaction date, amount, and an explanation of the issue. Do not send complete payment-card numbers or security codes by email. Our team will review the request against our policy and applicable consumer laws.",
        ],
      },
      {
        heading: "Payment Processing and Chargebacks",
        paragraphs: [
          "All subscription transactions and refund disbursements are processed securely through Waffo. WYRPlay does not store full payment-card numbers. If you notice an unfamiliar or erroneous charge, please contact support@wyrplay.com promptly so we can investigate and assist before initiating a chargeback.",
        ],
      },
      {
        heading: "Statutory Consumer Rights",
        paragraphs: [
          "Nothing in this policy limits or waives any non-waivable statutory consumer rights, mandatory cooling-off periods, or automatic-renewal protections guaranteed under the laws of your jurisdiction.",
        ],
      },
      {
        heading: "Changes to This Policy",
        paragraphs: [
          "We may update this Refund and Cancellation Policy from time to time. The effective date at the top indicates the current version.",
        ],
      },
    ],
    account_deletion: [
      {
        heading: "When This Page Applies",
        paragraphs: [
          "Public account registration is not currently open in the production service. When account functionality is opened, the account deletion procedures described below apply.",
          "This page explains how users with a registered WYRPlay account can request deletion of their account and associated personal information. If you only enjoy public question gameplay without creating an account, no account profile or authentication identity exists to delete.",
        ],
      },
      {
        heading: "How to Request Account Deletion",
        paragraphs: [
          "When account functionality is opened, to delete your account, sign in, open Account Settings, and select Delete Account. For security, recent re-authentication and explicit confirmation may be required.",
          "If you cannot access your account, you may email support@wyrplay.com from your registered account email address requesting deletion. We may perform reasonable verification before processing the request.",
        ],
      },
      {
        heading: "What Happens Upon Account Deletion",
        paragraphs: [
          "Once a valid deletion request is accepted, your access to the account is immediately revoked, and downstream cleanup of account-scoped personal data is initiated. If downstream dependencies experience temporary delays, the deletion request remains durable and will complete automatically.",
          "Your authentication identity and personal profile data are permanently detached or deleted. Anonymous or irreversibly aggregated data, such as public gameplay voting counts, cannot reasonably be linked back to you and will remain.",
        ],
      },
      {
        heading: "Subscriptions and Billing Coordination",
        paragraphs: [
          "When account and subscription functionality are opened, if an account has an active paid subscription, the deletion workflow coordinates cancellation with our payment provider (Waffo) to stop future renewals before completing identity deletion. If you only wish to stop future subscription charges while keeping your account, use the subscription cancellation option in Billing instead of deleting your account.",
          "Deleting an account does not erase records that must be retained for legitimate business, dispute resolution, tax, or legal compliance purposes.",
        ],
      },
      {
        heading: "Information We May Retain",
        paragraphs: [
          "We may retain limited transaction, refund, tax, security, and fraud-prevention records where retention is reasonably required by applicable law. Retained records are kept securely for the duration required by law and are not treated as an active consumer account.",
        ],
      },
      {
        heading: "Children and Parental Inquiries",
        paragraphs: [
          "WYRPlay strictly prohibits children under 13 from registering accounts. A parent or legal guardian who believes a child under 13 provided personal information or registered an account should contact support@wyrplay.com to request immediate review and deletion.",
        ],
      },
      {
        heading: "Questions About Deletion",
        paragraphs: [
          "For questions regarding account deletion or privacy requests, please contact Wang Yufei at support@wyrplay.com.",
        ],
      },
    ],
  },
} as const satisfies LegalConfig;
