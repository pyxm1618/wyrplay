import { NextResponse } from "next/server";
import { getPlayableQuestions } from "@/modules/would-you-rather";

export const dynamic = "force-static";

/** Loaded when the homepage Finder is used, keeping its database out of the hero payload. */
export function GET() {
  return NextResponse.json(getPlayableQuestions(), {
    headers: {
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
