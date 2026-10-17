"use client";

import { showPrivacySettings } from "@/platform/consent/consent-adapter";

export function PrivacySettingsButton() {
  return (
    <li>
      <button
        type="button"
        onClick={showPrivacySettings}
        className="text-left text-sm leading-relaxed text-muted transition-colors hover:text-foreground"
      >
        Privacy &amp; cookie settings
      </button>
    </li>
  );
}
