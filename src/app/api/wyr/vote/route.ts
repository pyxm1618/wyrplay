import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  getQuestionVoteStats,
  recordAggregateOnlyVote,
  recordVote,
  usesAggregateOnlyVoting,
} from "@/modules/would-you-rather/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOTER_COOKIE_NAME = "wyr_vid";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

function resolveVoterId(cookieStore: Awaited<ReturnType<typeof cookies>>): {
  voterId: string;
  isNew: boolean;
} {
  const existing = cookieStore.get(VOTER_COOKIE_NAME)?.value;
  if (existing && existing.trim().length > 0) {
    return { voterId: existing, isNew: false };
  }
  return { voterId: crypto.randomUUID(), isNew: true };
}

function applyNoStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, no-cache, max-age=0");
  return response;
}

function applyVoterCookie(response: NextResponse, voterId: string, isNew: boolean): NextResponse {
  if (isNew) {
    response.cookies.set({
      name: VOTER_COOKIE_NAME,
      value: voterId,
      httpOnly: true,
      secure: process.env.APP_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });
  }
  // 个人投票状态严禁共享缓存
  return applyNoStore(response);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId || questionId.trim() === "") {
      return NextResponse.json({ error: "Missing 'questionId' query parameter" }, { status: 400 });
    }

    if (usesAggregateOnlyVoting(questionId)) {
      // Kids-collection questions never create/read the persistent voter cookie.
      const stats = await getQuestionVoteStats(questionId);
      return applyNoStore(NextResponse.json(stats));
    }

    const cookieStore = await cookies();
    const { voterId, isNew } = resolveVoterId(cookieStore);

    const stats = await getQuestionVoteStats(questionId, voterId);
    const response = NextResponse.json(stats);
    return applyVoterCookie(response, voterId, isNew);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load vote stats";
    const status = message.includes("Invalid question ID") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
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

    if (usesAggregateOnlyVoting(questionId)) {
      // Store only an anonymous aggregate contribution; no reusable voter identifier
      // is created, read, or persisted for Kids-collection voting.
      const stats = await recordAggregateOnlyVote({ questionId, option });
      return applyNoStore(NextResponse.json(stats));
    }

    const cookieStore = await cookies();
    const { voterId, isNew } = resolveVoterId(cookieStore);

    const stats = await recordVote({
      questionId,
      option,
      anonymousVoterId: voterId,
    });

    const response = NextResponse.json(stats);
    return applyVoterCookie(response, voterId, isNew);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record vote";
    const status =
      message.includes("Invalid question ID") ||
      message.includes("Invalid option") ||
      message.includes("not approved for voting")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
