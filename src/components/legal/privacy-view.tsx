import Image from "next/image";
import Link from "next/link";

import type { LegalDocumentVersion, LegalSectionContent } from "@/platform/legal/types";
import { legalConfig } from "@/config/legal.config";

import "./privacy-view.css";

function SectionIcon({ index }: Readonly<{ index: number }>) {
  // Return semantic SVG icon corresponding to section purpose
  switch (index % 10) {
    case 0:
      // Document / Overview
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 1:
      // User / Identity
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 2:
      // Settings / Gears / Use
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 3:
      // Cookie
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5v.01" />
          <path d="M16 15.5v.01" />
          <path d="M12 12v.01" />
          <path d="M11 17v.01" />
          <path d="M7 13v.01" />
        </svg>
      );
    case 4:
      // Group / Accounts
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 5:
      // Analytics / Bar chart
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 6:
      // Data Retention / Database
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 7:
      // Toggle / Choices
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
          <circle cx="16" cy="12" r="3" />
        </svg>
      );
    case 8:
      // Children / Shield
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    default:
      // Lock / Security
      return (
        <svg
          className="privacy-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
  }
}

export function PrivacyView({
  document,
  sections,
}: Readonly<{
  document: LegalDocumentVersion;
  sections: readonly LegalSectionContent[];
}>) {
  return (
    <div className="privacy-page">
      {/* Corner Cloud Decorations */}
      <Image
        className="privacy-cloud privacy-cloud--tl"
        src="/privacy-cloud-tl.webp"
        alt=""
        width={160}
        height={200}
        loading="eager"
        unoptimized
      />
      <Image
        className="privacy-cloud privacy-cloud--tr"
        src="/privacy-cloud-tr.webp"
        alt=""
        width={144}
        height={200}
        loading="eager"
        unoptimized
      />
      <Image
        className="privacy-cloud privacy-cloud--bl"
        src="/privacy-cloud-bl.webp"
        alt=""
        width={160}
        height={240}
        loading="eager"
        unoptimized
      />
      <Image
        className="privacy-cloud privacy-cloud--br"
        src="/privacy-cloud-br.webp"
        alt=""
        width={160}
        height={240}
        loading="eager"
        unoptimized
      />

      <main className="privacy-container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="privacy-breadcrumbs">
          <ol className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <li>
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-400">
              ›
            </li>
            <li aria-current="page" className="text-slate-800 font-semibold">
              Privacy
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="privacy-hero">
          <div className="privacy-hero-left">
            <span className="privacy-badge">Your Privacy Matters</span>
            <div className="privacy-title-wrapper">
              <Image
                className="privacy-crown-doodle"
                src="/hero-crown.webp"
                alt=""
                width={52}
                height={34}
                loading="eager"
                unoptimized
              />
              <h1 className="privacy-title">
                Privacy <span className="privacy-title-highlight">Notice</span>
              </h1>
            </div>
            <p className="privacy-subtitle">
              This notice explains how WYRPlay collects, uses, and protects your information.
            </p>
            <p className="privacy-meta">
              Effective {document.effectiveDate} | Last updated: {document.effectiveDate}
            </p>
          </div>

          <div className="privacy-hero-art" aria-hidden="true">
            <Image
              className="privacy-hero-img"
              src="/hero-shield.webp"
              alt="WYRPlay Privacy Shield and Protection Illustration"
              width={360}
              height={230}
              priority
              unoptimized
            />
          </div>
        </header>

        {/* Two-Column Grid: Sticky Sidebar + Main Content Cards */}
        <div className="privacy-body-grid">
          {/* Left Sticky Sidebar */}
          <aside className="privacy-sidebar" aria-label="Table of contents">
            <h2 className="privacy-sidebar-heading">On this page</h2>
            <nav>
              <ul className="privacy-sidebar-nav">
                {sections.map((section, idx) => (
                  <li key={section.heading} className="privacy-sidebar-item">
                    <a href={`#section-${idx + 1}`} className="privacy-sidebar-link">
                      <span className="privacy-sidebar-num">{idx + 1}</span>
                      <span className="privacy-sidebar-text">{section.heading}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Right Main Content Card Container */}
          <div className="privacy-content">
            {sections.map((section, idx) => (
              <section
                key={section.heading}
                id={`section-${idx + 1}`}
                className="privacy-section"
              >
                <div className="privacy-num-badge">{idx + 1}</div>
                <SectionIcon index={idx} />
                <div className="privacy-section-body">
                  <h2 className="privacy-section-title">{section.heading}</h2>
                  <div className="privacy-paragraphs">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Bottom Contact / Help Banner */}
        <section className="privacy-contact-card" aria-label="Privacy Support Contact">
          <div className="privacy-contact-left">
            <Image
              className="privacy-contact-icon"
              src="/contact-envelope.webp"
              alt=""
              width={52}
              height={48}
              loading="eager"
              unoptimized
            />
            <div>
              <h2 className="privacy-contact-title">Questions about your privacy?</h2>
              <p className="privacy-contact-sub">We&apos;re here to help. Contact us anytime.</p>
            </div>
          </div>
          <div className="privacy-contact-right">
            <Link href="/contact" className="privacy-contact-btn">
              Contact us &rarr;
            </Link>
            <a
              href={`mailto:${legalConfig.operator.supportEmail}`}
              className="privacy-contact-email"
            >
              {legalConfig.operator.supportEmail}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
