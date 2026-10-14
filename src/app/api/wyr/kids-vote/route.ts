import { type NextRequest, NextResponse } from "next/server";

import {
  getQuestionVoteStats,
  isValidQuestion,
  isVotableQuestion,
  recordAggregateOnlyVote,
  usesAggregateOnlyVoting,
} from "@/modules/would-you-rather/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEGACY_VOTER_COOKIE_NAME = "wyr_vid";

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, no-cache, max-age=0");

  // Remove the pre-privacy-hardening root-scoped voter cookie if an existing
  // browser still has one. New general-audience voter cookies are scoped to
  // /api/wyr/vote and therefore are never sent to this Kids endpoint.
  response.cookies.set({
    name: LEGACY_VOTER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.APP_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET(request: NextRequest) {
  try {
    const questionId = new URL(request.url).searchParams.get("questionId");
    if (!questionId || questionId.trim() === "") {
      return NextResponse.json({ error: "Missing 'questionId' query parameter" }, { status: 400 });
    }
    if (!isValidQuestion(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    if (!usesAggregateOnlyVoting(questionId)) {
      return NextResponse.json(
        { error: "Question does not use aggregate-only voting" },
        { status: 400 },
      );
    }

    return noStore(NextResponse.json(await getQuestionVoteStats(questionId)));
  } catch (error: unknown) {
    console.error("Vote API failed", error);
    return NextResponse.json({ error: "Failed to load vote stats" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { questionId, option } = body as { questionId?: unknown; option?: unknown };
    if (typeof questionId !== "string" || questionId.trim() === "") {
      return NextResponse.json({ error: "Missing or invalid 'questionId'" }, { status: 400 });
    }
    if (option !== "A" && option !== "B") {
      return NextResponse.json({ error: "Invalid 'option', must be 'A' or 'B'" }, { status: 400 });
    }
    if (!isVotableQuestion(questionId)) {
      return NextResponse.json({ error: "Question is not approved for voting" }, { status: 400 });
    }

    if (!usesAggregateOnlyVoting(questionId)) {
      return NextResponse.json(
        { error: "Question does not use aggregate-only voting" },
        { status: 400 },
      );
    }

    return noStore(
      NextResponse.json(
        await recordAggregateOnlyVote({
          questionId,
          option,
        }),
      ),
    );
  } catch (error: unknown) {
    console.error("Vote API failed", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
