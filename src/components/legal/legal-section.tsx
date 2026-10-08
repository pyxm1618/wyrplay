import type { ReactNode } from "react";

import type { LegalSectionContent } from "@/platform/legal/types";

const URL_REGEX = /(https:\/\/[^\s]+)/g;

function renderParagraphWithLinks(text: string): ReactNode {
  if (!text.includes("https://")) {
    return text;
  }

  const parts = text.split(URL_REGEX);
  return parts.map((part, index) => {
    if (part.startsWith("https://")) {
      const match = part.match(/^(https:\/\/[^\s.,;)]+.*?)([.,;)]*)$/);
      if (match) {
        const [, url, trailing] = match;
        return (
          <span key={index}>
            <a href={url} className="underline hover:text-foreground">
              {url}
            </a>
            {trailing}
          </span>
        );
      }
      return (
        <a key={index} href={part} className="underline hover:text-foreground">
          {part}
        </a>
      );
    }
    return part;
  });
}

export function LegalSection({ section }: Readonly<{ section: LegalSectionContent }>) {
  const sectionId = section.heading
    .toLowerCase()
    .replaceAll("'", "")
    .replaceAll("’", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <section id={sectionId} className="mt-10 scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{section.heading}</h2>
      <div className="mt-3 space-y-3">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-[0.9375rem] leading-relaxed text-muted">
            {renderParagraphWithLinks(paragraph)}
          </p>
        ))}
      </div>
    </section>
  );
}
